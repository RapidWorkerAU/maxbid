import { describe, expect, it } from 'vitest';
import { RESULT_SITES, lotPagesAmong, resultQueryFor } from './auctionResults';
import type { SearchResult } from './brave';

const subject = {
  year: 2008,
  brand: 'Toyota',
  model: 'Landcruiser GXL',
  specs: { fuel: 'Diesel' },
};

const result = (url: string): SearchResult => ({
  title: 'A past lot',
  url,
  snippet: '',
  host: new URL(url).hostname,
});

describe('the search that finds past lots', () => {
  it('searches the auction house own site', () => {
    expect(resultQueryFor(subject, 'grays.com')).toContain('site:grays.com');
  });

  it('searches for the item as triage identified it', () => {
    const query = resultQueryFor(subject, 'grays.com')!;
    expect(query).toContain('2008');
    expect(query).toContain('Toyota');
    expect(query).toContain('Landcruiser GXL');
    expect(query).toContain('Diesel');
  });

  it('drops the words that pull retail listings', () => {
    // "for sale australia" finds forecourts, which is the wrong market when
    // what we want is what the thing fetched under a hammer.
    expect(resultQueryFor(subject, 'grays.com')).not.toMatch(/for sale australia/);
  });

  it('searches for nothing when there is nothing to search on', () => {
    expect(resultQueryFor({ year: 2008 }, 'grays.com')).toBeNull();
  });
});

describe('picking the lot pages out of a search', () => {
  const grays = RESULT_SITES[0];

  it('keeps a lot page', () => {
    const results = [result('https://www.grays.com/lot/0001-9060406/x/y')];
    expect(lotPagesAmong(results, grays.lotPath)).toHaveLength(1);
  });

  it('drops a catalogue page, which states no price for a closed sale', () => {
    const results = [result('https://www.grays.com/sale/23502297/computers-it-equipment')];
    expect(lotPagesAmong(results, grays.lotPath)).toHaveLength(0);
  });

  it('drops a search or category page', () => {
    const results = [
      result('https://www.grays.com/search/motor-vehicles'),
      result('https://www.grays.com/content.aspx?block=Terms'),
    ];
    expect(lotPagesAmong(results, grays.lotPath)).toHaveLength(0);
  });

  it('keeps the order the search gave, which is its idea of relevance', () => {
    const results = [
      result('https://www.grays.com/lot/0001-1/a/b'),
      result('https://www.grays.com/search/x'),
      result('https://www.grays.com/lot/0002-2/a/b'),
    ];
    expect(lotPagesAmong(results, grays.lotPath).map((r) => r.url)).toEqual([
      'https://www.grays.com/lot/0001-1/a/b',
      'https://www.grays.com/lot/0002-2/a/b',
    ]);
  });
});

describe('the sites results are looked for on', () => {
  it('covers the two auction houses we are cleared to read', () => {
    // Pickles is deliberately absent. Decision record 0012 removed it from V1
    // because its terms prohibit automated access.
    expect(RESULT_SITES.map((site) => site.host)).toEqual([
      'grays.com',
      'lloydsauctions.com.au',
    ]);
  });

  it('does not look at Pickles', () => {
    expect(RESULT_SITES.some((site) => site.host.includes('pickles'))).toBe(false);
  });
});
