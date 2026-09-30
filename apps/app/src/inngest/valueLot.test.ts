import { describe, expect, it } from 'vitest';
import { gradeForUsage, kilometresFrom, worthFetching } from './valueLot';
import type { ReadListing } from '../ai/readListings';

const listing = (over: Partial<ReadListing> = {}): ReadListing => ({
  index: 0,
  price: 39990,
  advertised: true,
  matchLevel: 'exact',
  reason: 'Same year, make and model.',
  year: 2008,
  usage: null,
  ...over,
});

describe('reading a kilometre figure out of what the model wrote', () => {
  it.each([
    ['145,200 km', 145200],
    ['145200', 145200],
    ['approximately 145,200 kms', 145200],
    ['Odometer: 145,200', 145200],
  ])('reads %s', (usage, expected) => {
    expect(kilometresFrom(usage)).toBe(expected);
  });

  it('reads nothing where nothing was said', () => {
    expect(kilometresFrom(null)).toBeNull();
    expect(kilometresFrom('not stated')).toBeNull();
  });

  it('refuses a figure that cannot be a reading', () => {
    expect(kilometresFrom('12 km')).toBeNull();
    expect(kilometresFrom('9,000,000 km')).toBeNull();
  });
});

describe('regrading a comparable once its usage is known', () => {
  // The Landcruiser: the lot has done 549,752 and the comparable 100,000.
  it('marks a comparable that has done far less as a higher specification', () => {
    // It is worth more than the lot, so it overstates value, which is exactly
    // what higherSpec means in matching-and-valuation.md.
    expect(gradeForUsage('exact', 549752, 100000)).toBe('higherSpec');
  });

  it('marks one that has done far more as a lower specification', () => {
    expect(gradeForUsage('exact', 100000, 549752)).toBe('lowerSpec');
  });

  it('leaves a small difference alone', () => {
    // 150,000 against 200,000 is the same sort of car.
    expect(gradeForUsage('exact', 150000, 200000)).toBe('exact');
  });

  it.each(['exact', 'nearExact', 'higherSpec', 'lowerSpec'] as const)(
    'caps a %s match when the lot has a reading and the page never stated one',
    (given) => {
      // An unknown difference is not the same as no difference.
      expect(gradeForUsage(given, 549752, null)).toBe('similarAlternative');
    },
  );

  it.each(['exact', 'nearExact'] as const)(
    'leaves a %s match alone where usage is not a thing the lot has',
    (given) => {
      // A desktop computer has no odometer and never will, so an unknown
      // reading on a comparable says nothing about it. Capping anyway held
      // every comparable in a 40 lot IT sale at similarAlternative, nothing
      // cleared the evidence threshold, and not one lot was valued.
      expect(gradeForUsage(given, null, null)).toBe(given);
    },
  );

  it('keeps the model grade when the readings are close', () => {
    // The Mercedes: our lot on 199,068 and a comparable on 257,843 is the
    // same sort of car. Holding it at similarAlternative after paying to read
    // the page would waste the thing we paid for.
    expect(gradeForUsage('nearExact', 199068, 257843)).toBe('nearExact');
  });

  it('leaves the grade alone when the lot own reading is unknown', () => {
    expect(gradeForUsage('exact', null, 100000)).toBe('exact');
  });
});

describe('choosing which pages are worth paying to fetch', () => {
  it('fetches only the comparables whose usage nobody stated', () => {
    const listings = [
      listing({ index: 0, usage: '145,200 km' }),
      listing({ index: 1, usage: null }),
      listing({ index: 2, usage: null }),
    ];
    expect(worthFetching(listings).map((l) => l.index)).toEqual([1, 2]);
  });

  it('fetches nothing when every snippet already said', () => {
    const listings = [listing({ usage: '145,200 km' }), listing({ index: 1, usage: '99,000 km' })];
    expect(worthFetching(listings)).toEqual([]);
  });

  it('stops at four, because each one is a page fetch', () => {
    // unit-costs.md budgets two cents a lot for the whole of triage.
    const listings = Array.from({ length: 10 }, (_, index) => listing({ index }));
    expect(worthFetching(listings)).toHaveLength(4);
  });
});
