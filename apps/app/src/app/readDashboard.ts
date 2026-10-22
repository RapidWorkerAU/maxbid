// The queries behind the dashboard. SC02.
//
// Apart from the page so the page stays under the 80 line limit.

import type { supabaseServer } from '../lib/supabase';
import type { AnalysisCard } from './dashboard';

type Client = Awaited<ReturnType<typeof supabaseServer>>;

/** How many recent analyses the dashboard shows. */
const RECENT = 6;

export async function readDashboard(supabase: Client) {
  const { data: membership } = await supabase
    .from('organisation_members')
    .select('role, org_id, organisations(name)')
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const [analyses, credits] = await Promise.all([
    supabase
      .from('analyses')
      .select('id, status, created_at, auctions(title)')
      .eq('org_id', membership.org_id)
      .order('created_at', { ascending: false })
      .limit(RECENT),
    supabase.rpc('credits_available', { target_org: membership.org_id }),
  ]);

  const ids = (analyses.data ?? []).map((row) => row.id);

  // One query for every card rather than one each. A dashboard that makes a
  // round trip per card gets slower every time somebody uses the product.
  const { data: lots } = ids.length
    ? await supabase
        .from('analysis_lots')
        .select('analysis_id, triage_max_bid')
        .in('analysis_id', ids)
    : { data: [] };

  const counts = new Map<string, { lots: number; withFigures: number }>();
  for (const row of lots ?? []) {
    const held = counts.get(row.analysis_id) ?? { lots: 0, withFigures: 0 };
    held.lots += 1;
    if (row.triage_max_bid !== null) held.withFigures += 1;
    counts.set(row.analysis_id, held);
  }

  const cards: AnalysisCard[] = (analyses.data ?? []).map((row) => ({
    id: row.id,
    // A catalogue we could not read the title of is still an analysis the
    // user started, so it is named rather than left blank.
    title: row.auctions?.title ?? 'A catalogue we could not name',
    status: row.status,
    lots: counts.get(row.id)?.lots ?? 0,
    withFigures: counts.get(row.id)?.withFigures ?? 0,
    createdAt: row.created_at,
  }));

  return {
    organisation: membership.organisations?.name ?? 'your organisation',
    role: membership.role,
    credits: credits.data ?? 0,
    cards,
  };
}
