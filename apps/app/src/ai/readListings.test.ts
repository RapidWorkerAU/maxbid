import { describe, expect, it } from 'vitest';
import { SYSTEM_PROMPT, capForUnknownUsage, readListings, userPromptFor } from './readListings';

const one = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    listings: [
      {
        index: 0,
        price: 18500,
        advertised: true,
        matchLevel: 'nearExact',
        reason: 'Same year, same model and same fuel, with a similar odometer reading.',
        year: 2015,
        usage: '150,000 km',
        ...over,
      },
    ],
  });

describe('reading what the model found', () => {
  it('reads a clean listing', () => {
    expect(readListings(one(), 10)).toEqual([
      {
        index: 0,
        price: 18500,
        advertised: true,
        matchLevel: 'nearExact',
        reason: 'Same year, same model and same fuel, with a similar odometer reading.',
        year: 2015,
        usage: '150,000 km',
      },
    ]);
  });

  it('strips a code fence', () => {
    expect(readListings('```json\n' + one() + '\n```', 10)).toHaveLength(1);
  });

  it('treats a missing advertised flag as an asking price', () => {
    // Most listings are asking prices, and treating one as a sold price would
    // skip the asking discount and value the lot too high.
    const [listing] = readListings(one({ advertised: undefined }), 10);
    expect(listing?.advertised).toBe(true);
  });

  it('keeps a sold price as sold', () => {
    const [listing] = readListings(one({ advertised: false }), 10);
    expect(listing?.advertised).toBe(false);
  });

  it('returns nothing when the model found nothing usable', () => {
    expect(readListings('{"listings": []}', 10)).toEqual([]);
  });
});

describe('dropping a row rather than repairing it', () => {
  // A comparable with an invented price or no reason cannot be shown to a user
  // as evidence, and it would still pull the valuation.
  it('drops a listing pointing at a result we never sent', () => {
    expect(readListings(one({ index: 40 }), 10)).toEqual([]);
    expect(readListings(one({ index: -1 }), 10)).toEqual([]);
  });

  it.each([0, -100, Number.NaN])('drops a price of %s', (price) => {
    expect(readListings(one({ price }), 10)).toEqual([]);
  });

  it('drops a price given as text', () => {
    expect(readListings(one({ price: '18,500' }), 10)).toEqual([]);
  });

  it('drops a match level we do not know', () => {
    expect(readListings(one({ matchLevel: 'quite close' }), 10)).toEqual([]);
  });

  it('drops a listing with no reason', () => {
    // F62 shows the reason beside the figure. Without one the user cannot tell
    // why a price is counted, so it does not count.
    expect(readListings(one({ reason: '   ' }), 10)).toEqual([]);
    expect(readListings(one({ reason: undefined }), 10)).toEqual([]);
  });

  it('keeps only the first reading of a result', () => {
    const twice = JSON.stringify({
      listings: [
        { index: 0, price: 18500, matchLevel: 'exact', reason: 'The same car.' },
        { index: 0, price: 21000, matchLevel: 'exact', reason: 'The same car again.' },
      ],
    });
    expect(readListings(twice, 10)).toHaveLength(1);
  });

  it('returns nothing rather than throwing when the reply is not JSON', () => {
    // One lot that cannot be read must not stop the other 299.
    expect(readListings('I could not find any prices.', 10)).toEqual([]);
    expect(readListings('[1,2,3]', 10)).toEqual([]);
  });
});

describe('the rule that caught a real mistake', () => {
  it('tells the model to check the year', () => {
    // A search for a 2015 Outlander returned a 2020 at $25,990. Taken as a
    // comparable it would lift a 2015 valuation by thousands, and nothing in
    // the number says so. Only the words around it do.
    expect(SYSTEM_PROMPT).toMatch(/Check the year/);
    expect(SYSTEM_PROMPT).toMatch(/different year is a different item/);
  });

  it('tells the model to skip pages that list many items', () => {
    expect(SYSTEM_PROMPT).toMatch(/category pages/);
  });

  it('tells the model that finding nothing is a real answer', () => {
    expect(SYSTEM_PROMPT).toMatch(/empty list[\s\S]*real answer/);
  });
});

describe('the words the model is given', () => {
  it('numbers the results so it can point back at them', () => {
    const prompt = userPromptFor('2015 Invented Wagon', [
      { title: 'A listing', snippet: 'Priced at $18,500', host: 'example.test' },
    ]);
    expect(prompt).toContain('0. [example.test] A listing');
    expect(prompt).toContain('$18,500');
  });

  it('says what the lot is, so the year can be checked against it', () => {
    expect(userPromptFor('2015 Invented Wagon Alpha Diesel', [])).toContain(
      'The lot: 2015 Invented Wagon Alpha Diesel',
    );
  });
});

describe('usage, which a valuation showed we were ignoring', () => {
  // A 2008 Landcruiser on 549,752 kilometres was graded an exact match for
  // ordinary ones and valued at $46,341 against a bid of $11,300. Decision
  // record 0019.
  it('tells the model that usage is usually the largest difference', () => {
    expect(SYSTEM_PROMPT).toMatch(/largest thing separating/);
  });

  it('tells it that less usage means worth more', () => {
    expect(SYSTEM_PROMPT).toMatch(/done much less than the lot[\s\S]*higherSpec/);
  });

  it('leaves the grade as the model gave it, because the page is not read yet', () => {
    // Capping here held every comparable at similarAlternative even after a
    // page fetch had found the reading, because the cap outlived its reason.
    // valueLot applies it once it knows whether the usage is really unknown.
    const [listing] = readListings(one({ matchLevel: 'exact', usage: null }), 10);
    expect(listing?.matchLevel).toBe('exact');
  });

  it('enforces the cap in code, not only in the prompt', () => {
    // The first version of this rule lived only in the prompt and said "use
    // nearExact at best". The model read that as permission and graded every
    // row nearExact, which scored a 549,752 kilometre Landcruiser higher than
    // leaving its odometer out altogether had.
    expect(capForUnknownUsage('exact')).toBe('similarAlternative');
    expect(capForUnknownUsage('nearExact')).toBe('similarAlternative');
  });

  it('leaves a grade that is already at or below the cap alone', () => {
    expect(capForUnknownUsage('similarAlternative')).toBe('similarAlternative');
    expect(capForUnknownUsage('insufficient')).toBe('insufficient');
  });

  it('keeps an exact match when the usage is stated', () => {
    const [listing] = readListings(one({ matchLevel: 'exact', usage: '148,000 km' }), 10);
    expect(listing?.matchLevel).toBe('exact');
  });

  it('keeps the usage as null when the model gave none', () => {
    const [listing] = readListings(one({ usage: undefined }), 10);
    expect(listing?.usage).toBeNull();
  });

  it('keeps what the snippet said about usage', () => {
    const [listing] = readListings(one({ usage: '549,752 km' }), 10);
    expect(listing?.usage).toBe('549,752 km');
  });
});
