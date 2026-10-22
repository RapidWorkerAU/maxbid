// How often a current bid is re-read. Decision record 0026.
//
// Bids do not move evenly. The Grays Perth sale of 29 September 2026 rose 51
// per cent in its final six hours, and one lot went from $1,809 to $7,200. So
// a sale close to closing is re-read often and a sale a week out is not,
// because the one closing soon is the only one where a stale figure misleads
// somebody.
//
// One catalogue page fetch returns every lot's bid on that page, which is what
// makes this affordable: the cost is per sale, where identification and
// valuation cost per lot.

import { createServiceSupabase } from '@maxbid/db/server';

/**
 * The intervals, set by Ashleigh in decision record 0026.
 *
 * Read in order, so the first tier a sale fits is the one that applies.
 * `withinHours: null` is everything further out.
 */
export const REFRESH_TIERS: { withinHours: number | null; everyMinutes: number }[] = [
  { withinHours: 2, everyMinutes: 10 },
  { withinHours: 24, everyMinutes: 30 },
  { withinHours: 48, everyMinutes: 60 },
  { withinHours: null, everyMinutes: 120 },
];

/**
 * The interval for a sale with no known closing time.
 *
 * We cannot tier what we cannot date. 30 minutes is the general case in the
 * table rather than a guess of its own, and the checked at sentence on screen
 * states the truth either way.
 */
export const UNKNOWN_CLOSING_MINUTES = 30;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/**
 * How many live lot rows one scan reads.
 *
 * Ordered oldest reading first, so a cap drops the sales least in need of a
 * re-read rather than an arbitrary set. Decision record 0024 measured 417 live
 * vehicle lots, so this holds several categories with room to spare.
 */
const LOTS_SCANNED = 5000;

/**
 * How often this sale's bids should be re-read, in minutes.
 *
 * Returns null for a sale that has closed. A bid cannot change after the sale
 * ends and S7 already reads what each lot fetched, so re-reading it forever
 * would spend the fetch budget on a figure that cannot move.
 */
export function refreshIntervalFor(closesAt: string | null, now: Date = new Date()): number | null {
  if (!closesAt) return UNKNOWN_CLOSING_MINUTES;

  const closes = new Date(closesAt).getTime();
  if (!Number.isFinite(closes)) return UNKNOWN_CLOSING_MINUTES;

  const hoursLeft = (closes - now.getTime()) / HOUR;
  if (hoursLeft <= 0) return null;

  for (const tier of REFRESH_TIERS) {
    if (tier.withinHours === null || hoursLeft <= tier.withinHours) return tier.everyMinutes;
  }
  // Unreachable while the last tier is open ended, and a number beats a crash
  // if somebody ever closes it.
  return UNKNOWN_CLOSING_MINUTES;
}

export type SaleToRefresh = {
  auctionId: string;
  closesAt: string | null;
  /** When any lot in this sale last had its bid read. Null means never. */
  bidCheckedAt: string | null;
};

/**
 * Whether this sale's bids are due to be re-read.
 *
 * A sale whose bids have never been read is due now: null is not an old
 * reading, it is no reading.
 */
export function needsRefresh(sale: SaleToRefresh, now: Date = new Date()): boolean {
  const everyMinutes = refreshIntervalFor(sale.closesAt, now);
  if (everyMinutes === null) return false;
  if (!sale.bidCheckedAt) return true;

  const checked = new Date(sale.bidCheckedAt).getTime();
  if (!Number.isFinite(checked)) return true;

  return now.getTime() - checked >= everyMinutes * MINUTE;
}

/**
 * The sales due a re-read, the longest unread first, up to a limit.
 *
 * Oldest first because a cap means some sales wait, and the one waiting
 * longest is the one whose figure on screen is furthest from the truth.
 *
 * The limit is what stops a backlog starving extraction, valuation and the
 * harvest of their share of eight fetches a minute.
 */
export function salesToRefresh(
  sales: SaleToRefresh[],
  limit: number,
  now: Date = new Date(),
): SaleToRefresh[] {
  return sales
    .filter((sale) => needsRefresh(sale, now))
    .sort((a, b) => {
      // Never read sorts above everything, which is the same rule as the
      // nulls first index this reads through.
      const left = a.bidCheckedAt ? new Date(a.bidCheckedAt).getTime() : -Infinity;
      const right = b.bidCheckedAt ? new Date(b.bidCheckedAt).getTime() : -Infinity;
      return left - right;
    })
    .slice(0, limit);
}

/**
 * Every live sale, with its closing time and its oldest bid reading.
 *
 * The oldest reading in the sale, not the newest, because one page fetch reads
 * every lot at once: if any lot is overdue the whole page is fetched anyway, so
 * the sale is as stale as its stalest lot.
 *
 * A sale with no lots is left out. There is nothing to re-read, and fetching
 * its page would be the extraction stage's job rather than this one's.
 */
export async function liveSales(now: Date = new Date()): Promise<SaleToRefresh[]> {
  const { data, error } = await createServiceSupabase()
    .from('lots')
    .select('auction_id, closes_at, bid_checked_at')
    // Closed sales are excluded here rather than filtered out afterwards. The
    // archive grows without limit and every sale we have ever read is in this
    // table, so reading them all to discard most would get slower forever.
    .or(`closes_at.is.null,closes_at.gte.${now.toISOString()}`)
    // Oldest reading first, which is what makes the first row seen for an
    // auction below its oldest one, and what the nulls first index serves.
    .order('bid_checked_at', { ascending: true, nullsFirst: true })
    .limit(LOTS_SCANNED);
  if (error) throw new Error(`Could not read the lots: ${error.message}`);

  const byAuction = new Map<string, SaleToRefresh>();
  for (const row of data ?? []) {
    const held = byAuction.get(row.auction_id);
    if (!held) {
      byAuction.set(row.auction_id, {
        auctionId: row.auction_id,
        closesAt: row.closes_at,
        bidCheckedAt: row.bid_checked_at,
      });
      continue;
    }
    // The soonest close in the sale decides the tier, so a sale is never read
    // less often than its most urgent lot needs.
    if (row.closes_at && (!held.closesAt || row.closes_at < held.closesAt)) {
      held.closesAt = row.closes_at;
    }
  }
  return [...byAuction.values()];
}
