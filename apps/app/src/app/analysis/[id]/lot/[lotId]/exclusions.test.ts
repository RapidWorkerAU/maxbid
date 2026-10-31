// What the lot screen does with a comparable somebody set aside. F62.

import { describe, expect, it } from 'vitest';
import { exclusionEffectIn, heaviestFirst, toComparables, type EvidenceRecord } from './lot';

const NOW = new Date('2026-10-31T12:00:00.000Z');

function record(id: string, weight = '0.95'): EvidenceRecord {
  return {
    id,
    match_level: 'exact',
    weight,
    excluded_by_user: false,
    comparable_snapshots: { price: '18500.00', checked_at: '2026-10-01T00:00:00.000Z' },
    comparables: {
      title: '2015 Invented Wagon Alpha Diesel',
      url: null,
      source_type: 'auction_result',
      source_name: 'Grays',
    },
  };
}

describe('a comparable this analysis set aside', () => {
  it('stays in the list, carrying the reason they gave', () => {
    // Hiding it would leave the figures changed and the reason for the change
    // nowhere on the page, and they could never put it back.
    const aside = new Map([['1', 'This is a different model.']]);
    const [row] = toComparables([record('1')], NOW, aside);
    expect(row!.excludedReason).toBe('This is a different model.');
  });

  it('reads as counted where this analysis set nothing aside', () => {
    expect(toComparables([record('1')], NOW)[0]!.excludedReason).toBeNull();
  });

  it('goes last, whatever it weighed', () => {
    // It counted for nothing, and the list is meant to open on what the range
    // actually rests on.
    const aside = new Map([['heavy', 'Not the same thing at all.']]);
    const rows = toComparables([record('heavy', '0.95'), record('light', '0.21')], NOW, aside);
    expect(heaviestFirst(rows).map((row) => row.id)).toEqual(['light', 'heavy']);
  });

  it('still sorts the counted ones heaviest first', () => {
    const rows = toComparables([record('light', '0.21'), record('heavy', '0.95')], NOW);
    expect(heaviestFirst(rows).map((row) => row.id)).toEqual(['heavy', 'light']);
  });
});

describe('what the exclusions did to the figures, for DS17', () => {
  it('reads the stored before and after', () => {
    expect(exclusionEffectIn({ excluded: 2, before: 17500, after: 14000 })).toEqual({
      excluded: 2,
      before: 17500,
      after: 14000,
    });
  });

  it('says nothing where nothing is set aside', () => {
    expect(exclusionEffectIn(null)).toBeNull();
    expect(exclusionEffectIn({ excluded: 0, before: 17500, after: 17500 })).toBeNull();
  });

  it('says nothing where one end of the sentence is missing', () => {
    // DS17 names two amounts. A disclaimer showing "[amount]" to a user is
    // worse than no disclaimer: it is a figure we promised and did not give.
    expect(exclusionEffectIn({ excluded: 1, before: 17500, after: null })).toBeNull();
    expect(exclusionEffectIn({ excluded: 1, before: null, after: 14000 })).toBeNull();
  });

  it('says nothing about a shape it does not recognise', () => {
    expect(exclusionEffectIn('two of them')).toBeNull();
    expect(exclusionEffectIn({})).toBeNull();
  });
});
