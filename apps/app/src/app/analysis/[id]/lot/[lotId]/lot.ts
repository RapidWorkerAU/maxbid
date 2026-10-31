// Reading one lot's evidence for the lot detail screen.
//
// Kept out of the page file so the page stays under the 80 line limit and so
// the shaping can be tested without a database.
//
// A comparable is three rows: the comparable itself, which is what the thing
// was, a snapshot, which is what it cost when we looked, and lot_comparables,
// which is how closely it matched this lot and how much that made it count.
// The screen needs all three, so the shaping happens here rather than in the
// page.

import type { Comparable } from '@maxbid/ui/composites/EvidenceRow';
import type { MatchLevel } from '@maxbid/ui/primitives/MatchBadge';

/** Postgres numerics arrive as strings, and every figure needs a number. */
export function asNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** One row of the three way join, as the page selects it. */
export type EvidenceRecord = {
  id: string;
  match_level: string | null;
  weight: number | string | null;
  /** Why it counted as the same thing, in plain English. F21. */
  reason?: string | null;
  excluded_by_user?: boolean | null;
  comparable_snapshots: { price: number | string | null; checked_at: string | null } | null;
  comparables: {
    title: string | null;
    url: string | null;
    source_type: string | null;
    source_name: string | null;
  } | null;
};

/**
 * The database spells a match level in snake case and the components in camel
 * case.
 *
 * This is a map rather than a string transform because getting it wrong is
 * silent: an unrecognised level falls back to insufficient, so the screen
 * would tell the reader every comparable was a failed match while the range
 * above it was built from exact ones.
 */
const MATCH_LEVELS: Record<string, MatchLevel> = {
  exact: 'exact',
  near_exact: 'nearExact',
  higher_spec: 'higherSpec',
  lower_spec: 'lowerSpec',
  similar_alternative: 'similarAlternative',
  insufficient: 'insufficient',
};

/**
 * Which source types are a price somebody paid rather than asked.
 *
 * It matters on screen because decision record 0020 weights a sold price at
 * 0.95 and an advertised one at 0.6, so a reader judging the evidence needs
 * to know which kind they are looking at.
 */
const SOLD = new Set(['auction_result', 'marketplace_sold', 'outcome']);

/** What each source type is, in words a reader can judge. */
const SOURCES: Record<string, string> = {
  auction_result: 'a past auction result',
  marketplace_sold: 'a completed marketplace sale',
  advertised_used: 'a used listing',
  new_retail: 'a new retail price, for reference only',
  outcome: 'a sale recorded by one of our users',
  user_supplied: 'a price a user gave us',
};

/** How old a price is, in whole days. Negative means we cannot date it. */
export function ageInDays(checkedAt: string | null, now: Date): number {
  if (!checkedAt) return -1;
  const checked = new Date(checkedAt).getTime();
  if (!Number.isFinite(checked)) return -1;
  return Math.max(0, Math.floor((now.getTime() - checked) / 86_400_000));
}

/**
 * Turns the stored evidence into the rows the panel shows.
 *
 * A row without a price, a title or a source we can name is left out rather
 * than shown with gaps. The panel exists so the reader can judge the
 * evidence, and a row they cannot judge adds nothing and makes the rest look
 * less careful than it is.
 *
 * A comparable this analysis set aside stays in the list, carrying the reason
 * they gave. F62. Hiding it would leave the figures changed and the reason
 * for the change nowhere on the page, and they could never put it back.
 */
export function toComparables(
  rows: EvidenceRecord[],
  now: Date = new Date(),
  setAside: Map<string, string> = new Map(),
): Comparable[] {
  return rows.flatMap((row) => {
    if (row.excluded_by_user) return [];

    const price = asNumber(row.comparable_snapshots?.price);
    const title = row.comparables?.title;
    const type = row.comparables?.source_type ?? '';
    const source = SOURCES[type];
    if (price === null || !title || !source) return [];

    return [
      {
        id: row.id,
        title,
        price,
        matchLevel: MATCH_LEVELS[row.match_level ?? ''] ?? 'insufficient',
        weight: asNumber(row.weight) ?? 0,
        ageInDays: ageInDays(row.comparable_snapshots?.checked_at ?? null, now),
        // The source in our own words, with the site named where we have it.
        source: row.comparables?.source_name
          ? `${source} on ${row.comparables.source_name}`
          : source,
        url: row.comparables?.url ?? null,
        reason: row.reason ?? null,
        excludedReason: setAside.get(row.id) ?? null,
        sold: SOLD.has(type),
      },
    ];
  });
}

/**
 * Heaviest evidence first.
 *
 * A sale they set aside goes last, whatever it weighed, because it counted
 * for nothing and the list is meant to open on what the range rests on.
 *
 * The reader should see what the range mostly rests on before what barely
 * counted. A panel that opens on a weight of 0.21 makes the whole range look
 * thinner than it is, and a panel that opens on a 0.95 sold result shows the
 * range being carried by the thing that should carry it.
 */
export function heaviestFirst(comparables: Comparable[]): Comparable[] {
  const aside = (c: Comparable) => (c.excludedReason ? 1 : 0);
  return [...comparables].sort((a, b) => aside(a) - aside(b) || b.weight - a.weight);
}

/**
 * DS17's figures, or nothing where there is nothing to say.
 *
 * Null for either end means we cannot state the sentence, and a disclaimer
 * with a gap in it showing to a user is worse than no disclaimer: it is a
 * figure we promised and did not give.
 */
export function exclusionEffectIn(
  stored: unknown,
): { excluded: number; before: number; after: number } | null {
  if (typeof stored !== 'object' || stored === null) return null;
  const effect = stored as Record<string, unknown>;
  const excluded = asNumber(effect.excluded as number | null);
  const before = asNumber(effect.before as number | null);
  const after = asNumber(effect.after as number | null);
  if (!excluded || before === null || after === null) return null;
  return { excluded, before, after };
}

/**
 * What these fetch at auction, from a stored valuation row.
 *
 * All three ends or none. Two ends and no middle is not a range, and a figure
 * we cannot state fully is one we must not state at all.
 */
export function auctionMarketIn(
  row: {
    auction_low: number | string | null;
    auction_typical: number | string | null;
    auction_high: number | string | null;
    auction_results: number | null;
  } | null,
): { low: number; typical: number; high: number; results: number } | null {
  if (!row) return null;
  const low = asNumber(row.auction_low);
  const typical = asNumber(row.auction_typical);
  const high = asNumber(row.auction_high);
  if (low === null || typical === null || high === null) return null;
  return { low, typical, high, results: row.auction_results ?? 0 };
}
