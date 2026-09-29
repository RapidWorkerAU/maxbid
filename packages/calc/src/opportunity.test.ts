import { describe, expect, it } from 'vitest';
import { CONFIDENCE_FACTORS, scoreCatalogue, weightedValueOf } from './opportunity';
import type { ScorableLot } from './opportunity';

const lot = (over: Partial<ScorableLot> & { id: string }): ScorableLot => ({
  targetBid: 10000,
  confidence: 'high',
  ...over,
});

describe('what a lot is worth, discounted by how sure we are', () => {
  it('trusts a high confidence valuation in full', () => {
    expect(weightedValueOf(lot({ id: 'a' }))).toBe(10000);
  });

  it.each([
    ['medium', 7500],
    ['low', 5000],
  ] as const)('discounts a %s confidence valuation', (confidence, expected) => {
    expect(weightedValueOf(lot({ id: 'a', confidence }))).toBe(expected);
  });

  it('scores a lot with no evidence at nothing', () => {
    // Not a small score. A lot we cannot value should not appear above one
    // we can.
    expect(weightedValueOf(lot({ id: 'a', confidence: 'insufficient' }))).toBe(0);
    expect(CONFIDENCE_FACTORS.insufficient).toBe(0);
  });

  it('scores a lot with no valuation at nothing', () => {
    expect(weightedValueOf(lot({ id: 'a', targetBid: null }))).toBe(0);
  });

  it('never counts a negative value', () => {
    expect(weightedValueOf(lot({ id: 'a', targetBid: -500 }))).toBe(0);
  });
});

describe('scoring a catalogue', () => {
  it('gives the best lot a hundred', () => {
    const scored = scoreCatalogue([
      lot({ id: 'small', targetBid: 2000 }),
      lot({ id: 'big', targetBid: 20000 }),
    ]);
    expect(scored[0]).toMatchObject({ id: 'big', score: 100 });
  });

  it('scales the rest against it', () => {
    const scored = scoreCatalogue([
      lot({ id: 'big', targetBid: 20000 }),
      lot({ id: 'half', targetBid: 10000 }),
    ]);
    expect(scored.find((l) => l.id === 'half')?.score).toBe(50);
  });

  it('rounds down, so a score never flatters a lot', () => {
    const scored = scoreCatalogue([
      lot({ id: 'best', targetBid: 3000 }),
      lot({ id: 'other', targetBid: 1999 }),
    ]);
    expect(scored.find((l) => l.id === 'other')?.score).toBe(66);
  });

  it('puts the best first', () => {
    const scored = scoreCatalogue([
      lot({ id: 'c', targetBid: 1000 }),
      lot({ id: 'a', targetBid: 9000 }),
      lot({ id: 'b', targetBid: 5000 }),
    ]);
    expect(scored.map((l) => l.id)).toEqual(['a', 'b', 'c']);
  });

  it('scores every lot at nothing when none could be valued', () => {
    // Dividing by the best of nothing would otherwise score them all 100.
    const scored = scoreCatalogue([
      lot({ id: 'a', targetBid: null }),
      lot({ id: 'b', targetBid: null }),
    ]);
    expect(scored.every((l) => l.score === 0)).toBe(true);
  });

  it('scores an empty catalogue without falling over', () => {
    expect(scoreCatalogue([])).toEqual([]);
  });
});

describe('the current bid does not decide the order', () => {
  // Decision record 0023. The Grays Perth sale rose 51 per cent in its last
  // six hours, and the Outlander went from $1,809 to $7,200. A bid taken at
  // analysis time records how early we looked.
  it('ranks two equally valuable lots equally, whatever they are bid to', () => {
    const scored = scoreCatalogue([
      lot({ id: 'barely-bid', targetBid: 9000 }),
      lot({ id: 'heavily-bid', targetBid: 9000 }),
    ]);
    expect(scored[0]?.score).toBe(scored[1]?.score);
  });

  it('puts a valuable lot above a cheap one that happens to have no bids', () => {
    // Headroom would have done the opposite on the real sale.
    const scored = scoreCatalogue([
      lot({ id: 'cheap-and-quiet', targetBid: 1500 }),
      lot({ id: 'valuable', targetBid: 12000 }),
    ]);
    expect(scored[0]?.id).toBe('valuable');
  });
});

describe('breaking a tie', () => {
  it('puts the lot closing soonest first', () => {
    const scored = scoreCatalogue([
      lot({ id: 'later', closesAt: '2026-09-29T14:00:00.000Z' }),
      lot({ id: 'sooner', closesAt: '2026-09-29T11:00:00.000Z' }),
    ]);
    expect(scored.map((l) => l.id)).toEqual(['sooner', 'later']);
  });

  it('puts a lot with no closing time last', () => {
    const scored = scoreCatalogue([
      lot({ id: 'unknown' }),
      lot({ id: 'known', closesAt: '2026-09-29T11:00:00.000Z' }),
    ]);
    expect(scored.map((l) => l.id)).toEqual(['known', 'unknown']);
  });

  it('lists the same catalogue the same way every time', () => {
    const lots = [lot({ id: 'b' }), lot({ id: 'a' }), lot({ id: 'c' })];
    expect(scoreCatalogue(lots).map((l) => l.id)).toEqual(['a', 'b', 'c']);
  });
});
