// Reading eBay's answer. Advertised evidence, per data-sources.md.

import { describe, expect, it } from 'vitest';
import { readEbayResults } from './ebay';
import { asSearchResult, withEbayFirst } from './ebayComparables';

function item(over: Record<string, unknown> = {}) {
  return {
    itemId: 'v1|123|0',
    title: '2015 Invented Wagon Alpha wheel set',
    itemWebUrl: 'https://www.ebay.com.au/itm/123',
    price: { value: '1850.00', currency: 'AUD' },
    condition: 'USED_EXCELLENT',
    itemLocation: { postalCode: '3000' },
    ...over,
  };
}

describe('reading a listing', () => {
  it('reads the price, the title and the link', () => {
    const [listing] = readEbayResults({ itemSummaries: [item()] });
    expect(listing).toMatchObject({
      price: 1850,
      title: '2015 Invented Wagon Alpha wheel set',
      url: 'https://www.ebay.com.au/itm/123',
    });
  });

  it('reads nothing from an answer with no listings in it', () => {
    expect(readEbayResults({})).toEqual([]);
    expect(readEbayResults({ itemSummaries: [] })).toEqual([]);
    expect(readEbayResults(null)).toEqual([]);
  });
});

describe('what it refuses to read', () => {
  it('leaves out a price in another currency rather than converting it', () => {
    // An exchange rate we applied would be our figure inside what is meant
    // to be somebody else's price, and the rate on the day a listing was
    // seen is not something we keep.
    expect(
      readEbayResults({ itemSummaries: [item({ price: { value: '1200.00', currency: 'USD' } })] }),
    ).toEqual([]);
  });

  it('leaves out a listing with no usable price', () => {
    expect(readEbayResults({ itemSummaries: [item({ price: undefined })] })).toEqual([]);
    expect(
      readEbayResults({ itemSummaries: [item({ price: { value: '0', currency: 'AUD' } })] }),
    ).toEqual([]);
    expect(
      readEbayResults({ itemSummaries: [item({ price: { value: 'free', currency: 'AUD' } })] }),
    ).toEqual([]);
  });

  it('leaves out a listing with no link, because evidence has to be checkable', () => {
    expect(readEbayResults({ itemSummaries: [item({ itemWebUrl: undefined })] })).toEqual([]);
  });

  it('keeps a listing that states no condition or location', () => {
    // Those are useful, not required. A price with a link is still evidence.
    const [listing] = readEbayResults({
      itemSummaries: [item({ condition: undefined, itemLocation: undefined })],
    });
    expect(listing).toMatchObject({ price: 1850, condition: null, location: null });
  });
});

describe('putting a listing where the valuation can read it', () => {
  it('puts the price in the words, because that is where prices are read from', () => {
    const result = asSearchResult(readEbayResults({ itemSummaries: [item()] })[0]!);
    expect(result.snippet).toContain('$1,850');
  });

  it('says the condition, which is what most changes what a used thing is worth', () => {
    const result = asSearchResult(readEbayResults({ itemSummaries: [item()] })[0]!);
    expect(result.snippet).toContain('used excellent');
  });

  it('says it is an asking price, not a sold one', () => {
    // These are active listings. Sold prices need the Marketplace Insights
    // API, which needs eBay's approval, which is O04.
    const result = asSearchResult(readEbayResults({ itemSummaries: [item()] })[0]!);
    expect(result.snippet).toContain('Asking price');
  });

  it('leaves out the condition sentence where there is no condition', () => {
    const listing = readEbayResults({ itemSummaries: [item({ condition: undefined })] })[0]!;
    expect(asSearchResult(listing).snippet).not.toContain('Condition');
  });
});

describe('putting the two sources together', () => {
  const ebay = { title: 'On eBay', url: 'https://ebay.com.au/itm/1', snippet: '', host: 'ebay.com.au' };
  const web = { title: 'On a dealer site', url: 'https://dealer.test/1', snippet: '', host: 'dealer.test' };

  it('puts eBay first, because its prices came from an API', () => {
    expect(withEbayFirst([ebay], [web]).map((r) => r.url)).toEqual([ebay.url, web.url]);
  });

  it('counts a listing both sources found only once', () => {
    // Searching the web for an item often turns up the same eBay listing,
    // and counting it twice would weigh one asking price as though it were
    // two.
    const sameAgain = { ...web, url: ebay.url };
    expect(withEbayFirst([ebay], [sameAgain])).toHaveLength(1);
  });

  it('works when either source found nothing', () => {
    expect(withEbayFirst([], [web])).toEqual([web]);
    expect(withEbayFirst([ebay], [])).toEqual([ebay]);
    expect(withEbayFirst([], [])).toEqual([]);
  });
});
