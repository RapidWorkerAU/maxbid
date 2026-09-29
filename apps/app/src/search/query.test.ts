import { describe, expect, it } from 'vitest';
import { queryFor } from './query';
import { plainText, readBraveResults } from './brave';

describe('building the search for a lot', () => {
  it('searches on the year, make and model', () => {
    expect(queryFor({ year: 2015, brand: 'Invented', model: 'Wagon Alpha' })).toBe(
      '2015 Invented Wagon Alpha for sale australia',
    );
  });

  it('adds the specs that separate one price from another', () => {
    // A diesel and a petrol of the same name are different money.
    const query = queryFor({
      year: 2015,
      brand: 'Invented',
      model: 'Wagon',
      specs: { fuel: 'Diesel', transmission: 'Automatic' },
    });
    expect(query).toContain('Diesel');
    expect(query).toContain('Automatic');
  });

  it('leaves out an odometer reading', () => {
    // Nobody searches for a mileage, and it would match almost nothing.
    const query = queryFor({
      brand: 'Invented',
      model: 'Wagon',
      specs: { odometer: '144,026', fuel: 'Diesel' },
    });
    expect(query).not.toContain('144');
    expect(query).toContain('Diesel');
  });

  it('does not repeat a word already in the model', () => {
    const query = queryFor({
      year: 2015,
      brand: 'Invented',
      model: 'Wagon Exceed',
      specs: { trim: 'Exceed' },
    });
    expect(query!.match(/Exceed/g)).toHaveLength(1);
  });

  it('asks for listings in Australia rather than reviews', () => {
    expect(queryFor({ brand: 'Invented', model: 'Wagon' })).toMatch(/for sale australia$/);
  });

  it('searches with only a make, or only a model', () => {
    expect(queryFor({ brand: 'Invented' })).toContain('Invented');
    expect(queryFor({ model: 'Wagon' })).toContain('Wagon');
  });

  it('refuses to search when there is nothing to search on', () => {
    // A search for a year alone returns a page of unrelated cars, and pricing
    // a lot against them is worse than admitting we do not know what it is.
    expect(queryFor({ year: 2015 })).toBeNull();
    expect(queryFor({})).toBeNull();
    expect(queryFor({ brand: '   ', model: null })).toBeNull();
  });
});

describe('reading what Brave sent back', () => {
  const payload = {
    web: {
      results: [
        {
          title: '2015 Invented Wagon for sale',
          url: 'https://example.com.au/listing/1',
          description: 'Priced at <strong>$18,500</strong> &amp; ready to go',
        },
        { title: 'No link here' },
        { url: 'not a url at all', title: 'Broken' },
      ],
    },
  };

  it('keeps the results that can be used', () => {
    const results = readBraveResults(payload);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      title: '2015 Invented Wagon for sale',
      url: 'https://example.com.au/listing/1',
      snippet: 'Priced at $18,500 & ready to go',
      host: 'example.com.au',
    });
  });

  it('drops a result with no link and one whose link cannot be read', () => {
    expect(readBraveResults(payload).map((r) => r.title)).not.toContain('Broken');
  });

  it('returns nothing rather than throwing on an answer it does not recognise', () => {
    expect(readBraveResults({})).toEqual([]);
    expect(readBraveResults(null)).toEqual([]);
    expect(readBraveResults({ web: { results: 'lots' } })).toEqual([]);
  });
});

describe('taking the provider markup out of a snippet', () => {
  it('removes the emphasis tags Brave adds', () => {
    expect(plainText('a <strong>price</strong> of $500')).toBe('a price of $500');
  });

  it('turns the escaped characters back into characters', () => {
    expect(plainText('Mitsubishi&#x27;s &quot;best&quot; &amp; cheapest')).toBe(
      'Mitsubishi\'s "best" & cheapest',
    );
  });

  it('settles the spacing, so a snippet reads as one line', () => {
    expect(plainText('  too   many \n\n spaces  ')).toBe('too many spaces');
  });
});

describe('not searching for the same word twice', () => {
  // Caught by a test rather than by a bad valuation. The real identifications
  // come back as model "Outlander Exceed" with a trim of "Exceed", and
  // comparing whole phrases missed it.
  it('sees a word inside a longer phrase', () => {
    const query = queryFor({
      brand: 'Invented',
      model: 'Wagon Exceed',
      specs: { trim: 'Exceed' },
    });
    expect(query!.match(/Exceed/g)).toHaveLength(1);
  });

  it('still adds a phrase that is only partly said already', () => {
    const query = queryFor({
      brand: 'Invented',
      model: 'Wagon Turbo',
      specs: { fuel: 'Turbo Diesel' },
    });
    expect(query).toContain('Turbo Diesel');
  });

  it('ignores the difference between upper and lower case', () => {
    const query = queryFor({ brand: 'Invented', model: 'Wagon DIESEL', specs: { fuel: 'diesel' } });
    expect(query!.toLowerCase().match(/diesel/g)).toHaveLength(1);
  });
});
