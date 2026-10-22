// Keeping the evidence a valuation was built from. F59.
//
// The database writes are proved by the row level security tests. What is
// tested here is the pairing, because a weight landing on the wrong listing
// would be invisible: the screen would show a real listing with a real weight
// that belonged to something else.

import { describe, expect, it } from 'vitest';
import { MATCH_LEVEL_IN_DB, evidenceFrom } from './storeEvidence';
import type { LotValuation } from './valueLot';

function valued(over: Partial<LotValuation> = {}): LotValuation {
  return {
    query: 'invented wagon alpha 2015 for sale australia',
    results: 2,
    auctionResults: [
      {
        url: 'https://example.test/lot/past-1',
        title: '2015 Invented Wagon Alpha',
        sourceName: 'Grays',
        ageInDays: 30,
        hammerPrice: 14500,
        closedAt: '2026-09-22T11:00:00.000Z',
        bidCount: 41,
        kilometres: 180000,
      },
    ],
    comparables: [
      {
        index: 0,
        price: 24990,
        advertised: true,
        matchLevel: 'higherSpec',
        reason: 'A newer one with fewer kilometres, advertised by a dealer.',
        year: 2016,
        usage: '120,000 km',
        result: {
          title: '2016 Invented Wagon Alpha',
          url: 'https://example.test/listing/1',
          snippet: '',
          host: 'dealer.example',
        },
        kilometres: 120000,
        pageFetched: false,
      },
    ],
    valuation: null,
    costUsd: 0.002,
    pagesFetched: 1,
    ...over,
  } as LotValuation;
}

describe('the ids the weights are matched by', () => {
  it('numbers results and listings the way the maths does', () => {
    // evidence.ts builds these ids by position, results first and then
    // listings. If the two ever disagree the weights land on the wrong rows.
    const ids = evidenceFrom(valued()).map((item) => item.id);
    expect(ids).toEqual(['result-0', 'listing-0']);
  });

  it('keeps results before listings, whatever the counts', () => {
    const many = valued({
      auctionResults: [valued().auctionResults[0]!, valued().auctionResults[0]!],
    });
    expect(evidenceFrom(many).map((item) => item.id)).toEqual([
      'result-0',
      'result-1',
      'listing-0',
    ]);
  });

  it('numbers a listing by its search position, not by its place in the list', () => {
    // A listing's index is which search result it came from, and the maths
    // uses that. Renumbering it here would break the pairing.
    const gappy = valued({
      comparables: [{ ...valued().comparables[0]!, index: 7 }],
    });
    expect(evidenceFrom(gappy).map((item) => item.id)).toContain('listing-7');
  });
});

describe('what each kind of evidence is recorded as', () => {
  it('records a past auction result as a sold price we read ourselves', () => {
    const [result] = evidenceFrom(valued());
    expect(result).toMatchObject({
      sourceType: 'auction_result',
      status: 'sold',
      provenance: 'extracted',
      price: 14500,
    });
  });

  it('records an advertised listing as active, not sold', () => {
    // Decision record 0020 weights a sold price at 0.95 and an advertised one
    // at 0.6, so which it is changes the range.
    const listing = evidenceFrom(valued())[1]!;
    expect(listing.sourceType).toBe('advertised_used');
    expect(listing.status).toBe('active');
  });

  it('records a completed marketplace sale as sold', () => {
    const sold = valued({
      comparables: [{ ...valued().comparables[0]!, advertised: false }],
    });
    expect(evidenceFrom(sold)[1]).toMatchObject({
      sourceType: 'marketplace_sold',
      status: 'sold',
    });
  });

  it('calls a snippet price estimated and a fetched page extracted', () => {
    // A price a model read out of a search snippet is not the same kind of
    // fact as one read off the listing itself, and the provenance tag says so.
    expect(evidenceFrom(valued())[1]!.provenance).toBe('estimated');

    const fetched = valued({
      comparables: [{ ...valued().comparables[0]!, pageFetched: true }],
    });
    expect(evidenceFrom(fetched)[1]!.provenance).toBe('extracted');
  });

  it("carries the model's own words as the reason the reader sees", () => {
    const listing = evidenceFrom(valued())[1]!;
    expect(listing.reason).toBe('A newer one with fewer kilometres, advertised by a dealer.');
  });

  it('says what a past result was, in a sentence with no dashes', () => {
    const [result] = evidenceFrom(valued());
    expect(result!.reason).toContain('$14,500');
    expect(result!.reason).not.toMatch(/[-–—]/);
  });

  it('names the site the listing came from', () => {
    expect(evidenceFrom(valued())[1]!.sourceName).toBe('dealer.example');
    expect(evidenceFrom(valued())[0]!.sourceName).toBe('Grays');
  });
});

describe('the match level the database stores', () => {
  it('has a spelling for every level the maths can produce', () => {
    // A level with no entry would be stored as undefined and rejected by the
    // check constraint, which would lose the evidence for that comparable.
    const levels = [
      'exact',
      'nearExact',
      'higherSpec',
      'lowerSpec',
      'similarAlternative',
      'insufficient',
    ] as const;
    for (const level of levels) {
      expect(MATCH_LEVEL_IN_DB[level], `${level} needs a database spelling`).toBeTruthy();
    }
  });

  it('spells them the way the check constraint requires', () => {
    expect(MATCH_LEVEL_IN_DB.nearExact).toBe('near_exact');
    expect(MATCH_LEVEL_IN_DB.similarAlternative).toBe('similar_alternative');
  });
});

describe('a valuation with nothing in it', () => {
  it('finds no evidence where there were no comparables', () => {
    expect(evidenceFrom(valued({ auctionResults: [], comparables: [] }))).toEqual([]);
  });
});
