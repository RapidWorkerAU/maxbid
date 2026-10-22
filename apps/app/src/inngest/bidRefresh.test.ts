// How often a current bid is re-read. Decision record 0026.
//
// The table is the whole decision, so the boundaries are tested on both sides
// rather than in the middle. A tier that is a minute out either way would be
// invisible in production and would change what the site shows as current.

import { describe, expect, it } from 'vitest';
import {
  REFRESH_TIERS,
  UNKNOWN_CLOSING_MINUTES,
  needsRefresh,
  refreshIntervalFor,
  salesToRefresh,
  type SaleToRefresh,
} from './bidRefresh';

const NOW = new Date('2026-10-22T12:00:00.000Z');

/** A closing time this many hours after NOW. */
const closesIn = (hours: number) =>
  new Date(NOW.getTime() + hours * 3_600_000).toISOString();

/** A reading this many minutes before NOW. */
const readAgo = (minutes: number) =>
  new Date(NOW.getTime() - minutes * 60_000).toISOString();

describe('the intervals Ashleigh set', () => {
  it('reads every 10 minutes inside the last 2 hours', () => {
    expect(refreshIntervalFor(closesIn(0.5), NOW)).toBe(10);
    expect(refreshIntervalFor(closesIn(2), NOW)).toBe(10);
  });

  it('reads every 30 minutes from 2 hours to 24 hours', () => {
    expect(refreshIntervalFor(closesIn(2.01), NOW)).toBe(30);
    expect(refreshIntervalFor(closesIn(24), NOW)).toBe(30);
  });

  it('reads every hour from 24 hours to 48 hours', () => {
    expect(refreshIntervalFor(closesIn(24.01), NOW)).toBe(60);
    expect(refreshIntervalFor(closesIn(48), NOW)).toBe(60);
  });

  it('reads every 2 hours beyond 48 hours', () => {
    expect(refreshIntervalFor(closesIn(48.01), NOW)).toBe(120);
    expect(refreshIntervalFor(closesIn(24 * 30), NOW)).toBe(120);
  });

  it('puts each boundary in the faster tier, not the slower one', () => {
    // Exactly 2 hours out is still the last 2 hours. Rounding the other way
    // would make a sale in its final minutes wait half an hour.
    expect(refreshIntervalFor(closesIn(2), NOW)).toBe(10);
    expect(refreshIntervalFor(closesIn(24), NOW)).toBe(30);
    expect(refreshIntervalFor(closesIn(48), NOW)).toBe(60);
  });

  it('has tiers that only get slower as the sale gets further out', () => {
    // A table that went the other way anywhere would read a distant sale more
    // often than a closing one, which is the opposite of the decision.
    const intervals = REFRESH_TIERS.map((tier) => tier.everyMinutes);
    expect([...intervals].sort((a, b) => a - b)).toEqual(intervals);
  });
});

describe('a sale the table does not cover', () => {
  it('never re-reads a sale that has closed', () => {
    // A bid cannot change after the sale ends, and S7 already reads what each
    // lot fetched. Without this every sale we have ever seen would be re-read
    // forever.
    expect(refreshIntervalFor(closesIn(-0.01), NOW)).toBeNull();
    expect(refreshIntervalFor(closesIn(-240), NOW)).toBeNull();
  });

  it('uses the general interval when the closing time is unknown', () => {
    expect(refreshIntervalFor(null, NOW)).toBe(UNKNOWN_CLOSING_MINUTES);
    expect(refreshIntervalFor('not a date', NOW)).toBe(UNKNOWN_CLOSING_MINUTES);
  });
});

describe('whether a sale is due', () => {
  const sale = (over: Partial<SaleToRefresh> = {}): SaleToRefresh => ({
    auctionId: 'auction-1',
    closesAt: closesIn(10),
    bidCheckedAt: readAgo(5),
    ...over,
  });

  it('is not due when it was read inside its interval', () => {
    expect(needsRefresh(sale({ bidCheckedAt: readAgo(29) }), NOW)).toBe(false);
  });

  it('is due once the interval has elapsed', () => {
    expect(needsRefresh(sale({ bidCheckedAt: readAgo(30) }), NOW)).toBe(true);
  });

  it('is due when the bid has never been read', () => {
    // Null is not an old reading, it is no reading.
    expect(needsRefresh(sale({ bidCheckedAt: null }), NOW)).toBe(true);
  });

  it('is due when the stored reading is not a date', () => {
    expect(needsRefresh(sale({ bidCheckedAt: 'never' }), NOW)).toBe(true);
  });

  it('is never due once the sale has closed, however old the reading', () => {
    expect(
      needsRefresh(sale({ closesAt: closesIn(-1), bidCheckedAt: readAgo(10_000) }), NOW),
    ).toBe(false);
  });

  it('follows the tier, so a closing sale is due sooner than a distant one', () => {
    const checked = readAgo(15);
    expect(needsRefresh(sale({ closesAt: closesIn(1), bidCheckedAt: checked }), NOW)).toBe(true);
    expect(needsRefresh(sale({ closesAt: closesIn(72), bidCheckedAt: checked }), NOW)).toBe(false);
  });
});

describe('choosing which sales one run reads', () => {
  const due = (auctionId: string, minutesAgo: number | null): SaleToRefresh => ({
    auctionId,
    closesAt: closesIn(10),
    bidCheckedAt: minutesAgo === null ? null : readAgo(minutesAgo),
  });

  it('leaves out the sales that are not due', () => {
    const chosen = salesToRefresh([due('a', 5), due('b', 90)], 10, NOW);
    expect(chosen.map((sale) => sale.auctionId)).toEqual(['b']);
  });

  it('reads the longest unread first', () => {
    // A cap means some sales wait, and the one waiting longest is the one
    // whose figure on screen is furthest from the truth.
    const chosen = salesToRefresh([due('a', 40), due('b', 200), due('c', 90)], 10, NOW);
    expect(chosen.map((sale) => sale.auctionId)).toEqual(['b', 'c', 'a']);
  });

  it('puts a sale never read above every sale that has been', () => {
    const chosen = salesToRefresh([due('a', 5000), due('b', null)], 10, NOW);
    expect(chosen[0]!.auctionId).toBe('b');
  });

  it('never returns more than the limit', () => {
    const many = Array.from({ length: 50 }, (_, i) => due(`a${i}`, 100 + i));
    expect(salesToRefresh(many, 8, NOW)).toHaveLength(8);
  });

  it('returns nothing when nothing is due', () => {
    expect(salesToRefresh([due('a', 1)], 8, NOW)).toEqual([]);
  });
});
