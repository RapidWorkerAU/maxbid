import { describe, expect, it } from 'vitest';
import { ageInDays, heaviestFirst, toComparables, type EvidenceRecord } from './lot';
import { methodFor } from './readLot';

const NOW = new Date('2026-10-22T12:00:00.000Z');
const daysBefore = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();

function record(over: Partial<EvidenceRecord> = {}): EvidenceRecord {
  return {
    id: '1',
    match_level: 'exact',
    weight: '0.95',
    excluded_by_user: false,
    comparable_snapshots: { price: '18500.00', checked_at: daysBefore(30) },
    comparables: {
      title: '2015 Invented Wagon Alpha Diesel',
      url: null,
      source_type: 'auction_result',
      source_name: 'Grays',
    },
    ...over,
  };
}

describe('shaping the evidence for the panel', () => {
  it('reads the price, the match level and the weight', () => {
    const [row] = toComparables([record()], NOW);
    expect(row).toMatchObject({ price: 18500, matchLevel: 'exact', weight: 0.95 });
  });

  it('says in words where the price came from, and names the site', () => {
    const [row] = toComparables([record()], NOW);
    expect(row!.source).toBe('a past auction result on Grays');
  });

  it('marks a sold price as sold and an advertised one as not', () => {
    // Decision record 0020 weights the two very differently, so a reader
    // judging the evidence has to be able to tell them apart.
    const sold = toComparables([record()], NOW)[0];
    expect(sold!.sold).toBe(true);

    const asking = toComparables(
      [record({ comparables: { ...record().comparables!, source_type: 'advertised_used' } })],
      NOW,
    )[0];
    expect(asking!.sold).toBe(false);
  });

  it('treats a sale one of our users recorded as sold', () => {
    const outcome = toComparables(
      [record({ comparables: { ...record().comparables!, source_type: 'outcome' } })],
      NOW,
    )[0];
    expect(outcome!.sold).toBe(true);
  });
});

describe('what the panel refuses to show', () => {
  it('leaves out a row with no price', () => {
    // The panel exists so the reader can judge the evidence, and a row they
    // cannot judge makes the rest look less careful than it is.
    expect(
      toComparables([record({ comparable_snapshots: { price: null, checked_at: null } })], NOW),
    ).toEqual([]);
  });

  it('leaves out a row with no title', () => {
    expect(
      toComparables([record({ comparables: { ...record().comparables!, title: null } })], NOW),
    ).toEqual([]);
  });

  it('leaves out a row whose source we cannot name', () => {
    expect(
      toComparables(
        [record({ comparables: { ...record().comparables!, source_type: 'something new' } })],
        NOW,
      ),
    ).toEqual([]);
  });

  it('leaves out a comparable the user excluded', () => {
    // They have already said it does not belong. Showing it as evidence
    // would contradict them. F62.
    expect(toComparables([record({ excluded_by_user: true })], NOW)).toEqual([]);
  });

  it('falls back to insufficient rather than trusting an unknown match level', () => {
    const [row] = toComparables([record({ match_level: 'perfect' })], NOW);
    expect(row!.matchLevel).toBe('insufficient');
  });

  it('reads a missing weight as nought, not as one', () => {
    const [row] = toComparables([record({ weight: null })], NOW);
    expect(row!.weight).toBe(0);
  });
});

describe('dating a price', () => {
  it('counts whole days', () => {
    expect(ageInDays(daysBefore(30), NOW)).toBe(30);
    expect(ageInDays(NOW.toISOString(), NOW)).toBe(0);
  });

  it('says it cannot date a price rather than calling it new', () => {
    // A price with no date read as today would be weighted as the freshest
    // evidence we have, which is the opposite of the truth.
    expect(ageInDays(null, NOW)).toBe(-1);
    expect(ageInDays('whenever', NOW)).toBe(-1);
  });

  it('never reports a negative age for a date in the future', () => {
    expect(ageInDays(new Date(NOW.getTime() + 86_400_000).toISOString(), NOW)).toBe(0);
  });
});

describe('the order the evidence is shown in', () => {
  it('puts the heaviest first', () => {
    // A panel that opens on a weight of 0.21 makes the whole range look
    // thinner than it is.
    const rows = toComparables(
      [
        record({ id: 'light', weight: '0.21' }),
        record({ id: 'heavy', weight: '0.95' }),
        record({ id: 'middle', weight: '0.54' }),
      ],
      NOW,
    );
    expect(heaviestFirst(rows).map((row) => row.id)).toEqual(['heavy', 'middle', 'light']);
  });

  it('does not change the list it was given', () => {
    const rows = toComparables([record({ id: 'a', weight: '0.2' }), record({ id: 'b' })], NOW);
    heaviestFirst(rows);
    expect(rows.map((row) => row.id)).toEqual(['a', 'b']);
  });
});

describe('reading the match level the database stores', () => {
  it('translates every snake case level the database allows', () => {
    // The database spells these in snake case and the components in camel
    // case. Getting it wrong is silent: an unrecognised level falls back to
    // insufficient, so the screen would call every comparable a failed match
    // while the range above it was built from exact ones.
    const pairs = [
      ['exact', 'exact'],
      ['near_exact', 'nearExact'],
      ['higher_spec', 'higherSpec'],
      ['lower_spec', 'lowerSpec'],
      ['similar_alternative', 'similarAlternative'],
      ['insufficient', 'insufficient'],
    ] as const;

    for (const [stored, shown] of pairs) {
      const [row] = toComparables([record({ match_level: stored })], NOW);
      expect(row!.matchLevel, `${stored} should read as ${shown}`).toBe(shown);
    }
  });
});

describe('how the figures were worked out, in words', () => {
  it('names the resale it started from', () => {
    expect(methodFor(14000)).toContain('$14,000');
  });

  it('says what came off, in the order it came off', () => {
    const words = methodFor(14000);
    expect(words.indexOf('premium')).toBeLessThan(words.indexOf('your costs'));
    expect(words.indexOf('your costs')).toBeLessThan(words.indexOf('profit'));
  });

  it('uses no dashes, as the writing rules require', () => {
    expect(methodFor(14000)).not.toMatch(/[-–—]/);
  });

  it('says what the figure left over is', () => {
    expect(methodFor(14000)).toContain('the most you can bid');
  });
});

describe('why a comparable counted', () => {
  it('carries the reason we stored to the screen', () => {
    // F21. We have recorded this since the evidence tables were built and
    // never shown it.
    const [row] = toComparables(
      [record({ reason: 'Same model and year, one trim level higher.' })],
      NOW,
    );
    expect(row!.reason).toBe('Same model and year, one trim level higher.');
  });

  it('reads a missing reason as nothing rather than as empty text', () => {
    expect(toComparables([record({ reason: undefined })], NOW)[0]!.reason).toBeNull();
  });
});
