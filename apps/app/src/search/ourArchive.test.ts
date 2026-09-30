import { describe, expect, it } from 'vitest';
import { asAuctionResult, termsFor } from './ourArchive';

describe('what has to match before a stored lot counts', () => {
  it('takes every word of the make and the model', () => {
    expect(termsFor({ brand: 'Toyota', model: 'Landcruiser GXL' })).toEqual([
      'Toyota',
      'Landcruiser',
      'GXL',
    ]);
  });

  it('takes what it can when only one is known', () => {
    expect(termsFor({ brand: 'Dell', model: null })).toEqual(['Dell']);
  });

  it('drops a single letter, which would match almost anything', () => {
    expect(termsFor({ brand: 'Dell', model: 'X 7010' })).toEqual(['Dell', '7010']);
  });

  it('matches nothing when there is nothing to match on', () => {
    // Better than every past sale in the archive.
    expect(termsFor({ year: 2015 })).toEqual([]);
    expect(termsFor({ brand: '   ' })).toEqual([]);
  });
});

describe('turning a stored lot into a comparable', () => {
  const stored = {
    id: 'lot-1',
    title: '2008 Toyota Landcruiser GXL Diesel',
    source_url: 'https://www.grays.com/lot/0005-23502418/x/y',
    sold_price: '12800.00',
    sold_at: '2026-09-29T11:30:00.000Z',
    bid_count: 65,
    raw: { attributes: { odometer: '549,752' } },
  };
  const now = new Date('2026-10-06T00:00:00.000Z');

  it('carries the hammer price we recorded', () => {
    expect(asAuctionResult(stored, now)?.hammerPrice).toBe(12800);
  });

  it('carries the odometer we recorded, so the usage grading works', () => {
    expect(asAuctionResult(stored, now)?.kilometres).toBe(549752);
  });

  it('carries how old the sale is, so recency weighting bites', () => {
    expect(asAuctionResult(stored, now)?.ageInDays).toBe(7);
  });

  it('says where it came from, so the evidence can be traced', () => {
    expect(asAuctionResult(stored, now)?.sourceName).toBe('MaxBid archive');
    expect(asAuctionResult(stored, now)?.url).toContain('grays.com/lot/');
  });

  it('copes with a lot whose card stated no odometer', () => {
    // IT equipment has none, and never will.
    expect(asAuctionResult({ ...stored, raw: {} }, now)?.kilometres).toBeNull();
  });
});

describe('refusing a stored lot that is not a result', () => {
  const base = {
    id: 'lot-1',
    title: 'A lot',
    source_url: null,
    sold_price: '100',
    sold_at: '2026-09-29T11:30:00.000Z',
    bid_count: null,
    raw: null,
  };

  it('refuses one we have not read the result for', () => {
    expect(asAuctionResult({ ...base, sold_price: null as never })).toBeNull();
  });

  it('refuses a price of nothing', () => {
    // A lot that did not sell has no price, and recording one would put a
    // figure on something nobody bought.
    expect(asAuctionResult({ ...base, sold_price: '0' })).toBeNull();
  });

  it('refuses one with no date', () => {
    // The date is what lets recency weighting tell an old sale from a new one.
    expect(asAuctionResult({ ...base, sold_at: null })).toBeNull();
  });
});
