// S3 Normalise, the part that reads an auction's terms.
// Source: docs/02-specs/pipeline.md. F10, D25, decision records 0015 and 0016.
//
// The premium is not on the catalogue page. It is on each lot page, so this
// fetches one lot and reads the terms from it, which is one extra page per
// auction rather than one per lot.

import type { PremiumSchedule } from '@maxbid/calc';
import type { Json } from '@maxbid/db';
import { createServiceSupabase } from '@maxbid/db/server';
import { fetchPage } from '../extract/firecrawl';
import { parseGraysPremium, parseGraysSaleTitle } from '../extract/graysPremium';

export type AuctionTerms = {
  schedule: PremiumSchedule | null;
  /** Where the schedule came from, which DS12 shows the user. */
  source: 'extracted' | 'platform_default';
  title: string | null;
  /** The rows the schedule was read from, kept for the evidence trail. */
  rawTerms: string | null;
};

/**
 * Decides what an auction's terms are, given what a lot page said and what the
 * platform charges by default.
 *
 * Pure, so the rule can be tested without a network or a database. The whole
 * point of the fallback is DS12: a user must be told that the figure came from
 * a default rather than from this auction's own terms.
 */
export function termsFrom(
  page: string,
  platformDefault: PremiumSchedule | null,
): AuctionTerms {
  const parsed = parseGraysPremium(page);
  const title = parseGraysSaleTitle(page);

  if (parsed) {
    return { schedule: parsed.schedule, source: 'extracted', title, rawTerms: parsed.sourceText };
  }

  // Nothing readable on the page. The platform default is a real answer, but
  // only if there is one. Otherwise the auction keeps no premium at all, and
  // the user is asked for it rather than shown a figure we invented.
  return { schedule: platformDefault, source: 'platform_default', title, rawTerms: null };
}

/**
 * Reads the terms for an auction and stores them.
 *
 * Returns what it found so the step's output says plainly whether the premium
 * came from the auction or from a default.
 */
export async function readAuctionTerms(auctionId: string, lotUrl: string) {
  const supabase = createServiceSupabase();

  const auction = await supabase
    .from('auctions')
    .select('platform_id, auction_platforms(default_premium_schedule)')
    .eq('id', auctionId)
    .single();
  if (auction.error) throw new Error(`Could not read the auction: ${auction.error.message}`);

  const page = await fetchPage(lotUrl);
  const terms = termsFrom(
    page.markdown,
    (auction.data.auction_platforms?.default_premium_schedule ?? null) as PremiumSchedule | null,
  );

  const { error } = await supabase
    .from('auctions')
    .update({
      premium_schedule: (terms.schedule ?? null) as Json,
      premium_source: terms.source,
      raw_terms: terms.rawTerms,
      // GST on the premium is settled by the schedule itself now. This column
      // stays true, meaning GST is part of the premium one way or the other,
      // and includesGst inside the schedule says which. Decision record 0016.
      premium_gst: true,
      ...(terms.title ? { title: terms.title } : {}),
      extracted_at: new Date().toISOString(),
    })
    .eq('id', auctionId);
  if (error) throw new Error(`Could not store the auction terms: ${error.message}`);

  return {
    premiumSource: terms.source,
    bands: terms.schedule?.bands.length ?? 0,
    title: terms.title,
  };
}
