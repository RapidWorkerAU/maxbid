// What we already know a thing sold for. Decision record 0021.
//
// The harvester records what every lot of every catalogue we have read
// actually fetched. Nothing was reading it back. S5 searched the web for past
// Grays lots while 36 real Grays results sat in our own database.
//
// Reading our own archive costs no search, no page fetch and no rate limit. It
// is the cheapest evidence there is and the best: a sold price from the same
// auction house, and one we recorded ourselves rather than found through
// whatever a search engine happened to crawl.

import { createServiceSupabase } from '@maxbid/db/server';
import { ageInDays } from '../extract/graysResult';
import type { AuctionResult } from './auctionResults';
import type { QuerySubject } from './query';

/** How many past sales of the same thing are worth pulling out. */
export const MOST_FROM_ARCHIVE = 8;

/**
 * The words a stored lot has to contain to count as the same kind of thing.
 *
 * Deliberately plain. Postgres full text search would match more and would
 * also match more loosely, and a comparable that is not really the same item
 * is worse than no comparable at all. The make and the model both have to be
 * in the title.
 */
export function termsFor(subject: QuerySubject): string[] {
  return [subject.brand, subject.model]
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .flatMap((part) => part.trim().split(/\s+/))
    .filter((word) => word.length > 1);
}

/** What a stored lot looks like when it comes back. */
type StoredLot = {
  id: string;
  title: string;
  source_url: string | null;
  sold_price: number | string;
  sold_at: string | null;
  bid_count: number | null;
  raw: unknown;
};

/** The odometer we recorded for a past lot, where its card stated one. */
function kilometresOf(raw: unknown): number | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const attributes = (raw as Record<string, unknown>).attributes;
  if (typeof attributes !== 'object' || attributes === null) return null;
  const reading = (attributes as Record<string, unknown>).odometer;
  if (typeof reading !== 'string') return null;
  const value = Number(reading.replace(/[^\d]/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Turns a stored lot into the same shape a web search would have produced. */
export function asAuctionResult(lot: StoredLot, now?: Date): AuctionResult | null {
  const hammerPrice = Number(lot.sold_price);
  if (!Number.isFinite(hammerPrice) || hammerPrice <= 0) return null;
  if (!lot.sold_at) return null;

  return {
    hammerPrice,
    closedAt: lot.sold_at,
    bidCount: lot.bid_count,
    kilometres: kilometresOf(lot.raw),
    url: lot.source_url ?? '',
    title: lot.title,
    sourceName: 'MaxBid archive',
    ageInDays: ageInDays(lot.sold_at, now),
  };
}

/**
 * Past sales of the same thing, from catalogues we have already read.
 *
 * Costs one database query. No search, no page fetch, nothing rate limited,
 * and the result is a sold price we recorded ourselves.
 *
 * Returns nothing rather than something loose when there is not enough to
 * search on. A comparable that is not really the same item pulls a valuation
 * without anybody being able to see that it did.
 */
export async function fromOurArchive(
  subject: QuerySubject,
  options: { limit?: number; now?: Date } = {},
): Promise<AuctionResult[]> {
  const terms = termsFor(subject);
  if (terms.length === 0) return [];

  let query = createServiceSupabase()
    .from('lots')
    .select('id, title, source_url, sold_price, sold_at, bid_count, raw')
    .not('sold_price', 'is', null)
    .not('sold_at', 'is', null)
    .order('sold_at', { ascending: false })
    .limit(options.limit ?? MOST_FROM_ARCHIVE);

  // Every word has to appear, so a Landcruiser does not match a Land Rover.
  for (const term of terms) query = query.ilike('title', `%${term}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Could not read the archive: ${error.message}`);

  return (data ?? [])
    .map((lot) => asAuctionResult(lot as StoredLot, options.now))
    .filter((result): result is AuctionResult => result !== null);
}
