import { describe, expect, it } from 'vitest';
import { allComparables, enoughOnTheirOwn, listingAsComparable, resultAsComparable } from './evidence';
import type { AuctionResult } from '../search/auctionResults';
import type { ValuedComparable } from './valueLot';

const result = (over: Partial<AuctionResult> = {}): AuctionResult => ({
  hammerPrice: 15300,
  closedAt: '2023-11-06T10:00:00.000Z',
  bidCount: 123,
  kilometres: 442953,
  url: 'https://www.grays.com/lot/0001-1/a/b',
  title: 'A past Landcruiser',
  sourceName: 'Grays',
  ageInDays: 1058,
  ...over,
});

const listing = (over: Partial<ValuedComparable> = {}): ValuedComparable =>
  ({
    index: 0,
    price: 39990,
    advertised: true,
    matchLevel: 'nearExact',
    reason: 'Same year and model.',
    year: 2008,
    usage: null,
    kilometres: null,
    pageFetched: false,
    result: { title: 'A listing', url: 'https://example.test/1', snippet: '', host: 'example.test' },
    ...over,
  }) as ValuedComparable;

describe('a past sale as evidence', () => {
  it('carries the hammer price', () => {
    expect(resultAsComparable(result(), 549752, 0).price).toBe(15300);
  });

  it('counts as an auction result, which is weighted 0.95', () => {
    // An asking price is weighted 0.6. That difference is what decides
    // whether a lot gets a range at all.
    expect(resultAsComparable(result(), 549752, 0).evidenceType).toBe('auctionResult');
  });

  it('carries how old it is, so recency weighting can bite', () => {
    // Every web listing counts as current because Brave gives no dates. A
    // result from 2023 should not weigh the same as one from last month.
    expect(resultAsComparable(result(), 549752, 0).ageInDays).toBe(1058);
  });

  it('starts at near exact rather than exact', () => {
    // The same kind of item at the same kind of sale, but a different lot
    // with a different history.
    expect(resultAsComparable(result({ kilometres: 545000 }), 549752, 0).matchLevel).toBe('nearExact');
  });

  it('marks a result that has done far less as a higher specification', () => {
    // It is worth more than our lot, so it overstates it.
    expect(resultAsComparable(result({ kilometres: 243356 }), 549752, 0).matchLevel).toBe('higherSpec');
  });
});

describe('a web listing as evidence', () => {
  it('counts an asking price as advertised', () => {
    expect(listingAsComparable(listing()).evidenceType).toBe('advertisedUsed');
  });

  it('counts a sold price as sold', () => {
    expect(listingAsComparable(listing({ advertised: false })).evidenceType).toBe('marketplaceSold');
  });

  it('has no age, because a search gives none', () => {
    expect(listingAsComparable(listing()).ageInDays).toBe(0);
  });
});

describe('when past sales are enough on their own', () => {
  it('stops searching the web once there are four', () => {
    expect(enoughOnTheirOwn([result(), result(), result(), result()])).toBe(true);
  });

  it('keeps looking when there are fewer', () => {
    // A lot with one past sale needs whatever else can be found.
    expect(enoughOnTheirOwn([result(), result(), result()])).toBe(false);
    expect(enoughOnTheirOwn([])).toBe(false);
  });
});

describe('putting the evidence together', () => {
  it('puts the sold results first', () => {
    const all = allComparables([result()], [listing()], 549752);
    expect(all[0]?.evidenceType).toBe('auctionResult');
    expect(all[1]?.evidenceType).toBe('advertisedUsed');
  });

  it('keeps both kinds, because they answer different questions', () => {
    // A result says what the thing fetches under a hammer. A listing says
    // what a forecourt asks. A reseller lives in the gap between them.
    expect(allComparables([result()], [listing()], 549752)).toHaveLength(2);
  });

  it('gives every comparable its own id', () => {
    const all = allComparables([result(), result()], [listing(), listing({ index: 1 })], null);
    expect(new Set(all.map((c) => c.id)).size).toBe(4);
  });
});
