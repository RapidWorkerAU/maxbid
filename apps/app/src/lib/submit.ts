'use server';

import { createServiceSupabase } from '@maxbid/db/server';
import { redirect } from 'next/navigation';
import { detectPlatform } from '../inngest/platforms';
import { analysisSubmitted, inngest } from '../inngest/client';
import { supabaseServer } from './supabase';

// S1 Ingest, the part that runs in the request. Source: pipeline.md.
//
// Detects the platform, creates the auction and analysis rows, then hands the
// work to Inngest. Everything slow happens in the background, because D14 lets
// the user leave and come back.

export type SubmitResult = { error: string } | null;

export async function submitAnalysis(_previous: SubmitResult, form: FormData): Promise<SubmitResult> {
  const rawUrl = String(form.get('url') ?? '').trim();

  const platform = detectPlatform(rawUrl);
  if (!platform.supported) return { error: platform.reason };

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: 'Your session has expired. Please sign in again.' };

  const { data: membership } = await supabase
    .from('organisation_members')
    .select('org_id')
    .limit(1)
    .maybeSingle();
  if (!membership) return { error: 'Create an organisation before you start an analysis.' };

  // The service client writes the shared auction rows, which no client may
  // touch. The analysis itself belongs to the organisation.
  const service = createServiceSupabase();

  const { data: platformRow, error: platformError } = await service
    .from('auction_platforms')
    .upsert({ slug: platform.slug, name: platform.slug }, { onConflict: 'slug' })
    .select('id')
    .single();
  if (platformError || !platformRow) {
    return { error: 'We could not start that analysis. Please try again.' };
  }

  // An auction is shared, so two organisations submitting the same link attach
  // to one auction rather than extracting it twice.
  const { data: auction, error: auctionError } = await service
    .from('auctions')
    .upsert(
      { platform_id: platformRow.id, source_url: rawUrl },
      { onConflict: 'platform_id,source_url' },
    )
    .select('id')
    .single();
  if (auctionError || !auction) {
    return { error: 'We could not read that auction link. Please check it and try again.' };
  }

  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .insert({
      org_id: membership.org_id,
      auction_id: auction.id,
      created_by: auth.user.id,
      source_type: 'url',
    })
    .select('id')
    .single();
  if (analysisError || !analysis) {
    return { error: 'We could not start that analysis. Please try again.' };
  }

  await inngest.send({
    name: analysisSubmitted.name,
    data: { analysisId: analysis.id, auctionId: auction.id, sourceType: 'url' as const },
  });

  redirect(`/analysis/${analysis.id}`);
}
