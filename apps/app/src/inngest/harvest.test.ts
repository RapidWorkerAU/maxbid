import { describe, expect, it } from 'vitest';
import { SETTLE_MINUTES, readyToHarvest } from './harvest';

describe('when a sale is ready to be read', () => {
  const now = new Date('2026-09-29T12:00:00.000Z');

  it('waits until every lot has closed and settled', () => {
    // A sale closes lot by lot, and a page read too early still says
    // "Ends in" rather than "Sold for".
    const justClosed = new Date(now.getTime() - 5 * 60_000).toISOString();
    expect(readyToHarvest(justClosed, now)).toBe(false);
  });

  it('is ready once the settling time has passed', () => {
    const settled = new Date(now.getTime() - (SETTLE_MINUTES + 1) * 60_000).toISOString();
    expect(readyToHarvest(settled, now)).toBe(true);
  });

  it('is not ready for a sale that has not closed', () => {
    const later = new Date(now.getTime() + 3600_000).toISOString();
    expect(readyToHarvest(later, now)).toBe(false);
  });

  it('is not ready for a sale with no closing time', () => {
    // Without one we cannot tell whether bidding has ended, and reading the
    // page early would record a current bid as a sold price.
    expect(readyToHarvest(null, now)).toBe(false);
  });

  it('is not ready for a closing time we cannot read', () => {
    expect(readyToHarvest('sometime on Tuesday', now)).toBe(false);
  });

  it('settles long enough for a staggered sale', () => {
    // The Grays vehicle sale closed all 36 lots at once, but a sale that
    // staggers them needs the gap to cover the last one.
    expect(SETTLE_MINUTES).toBeGreaterThanOrEqual(30);
  });
});
