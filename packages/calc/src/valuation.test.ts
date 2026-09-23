import { describe, expect, it } from 'vitest';
import { valueComparables, weighComparable, type Comparable } from './valuation';
import { MINIMUM_COMBINED_WEIGHT, MINIMUM_COMPARABLES } from './weights';

function comp(over: Partial<Comparable> = {}): Comparable {
  return {
    id: crypto.randomUUID(),
    price: 10000,
    matchLevel: 'exact',
    evidenceType: 'marketplaceSold',
    ageInDays: 30,
    ...over,
  };
}

describe('weighing one comparable', () => {
  it('multiplies match, evidence and recency', () => {
    // Near exact 0.85, marketplace sold 0.95, 30 days 1.
    const w = weighComparable(comp({ matchLevel: 'nearExact' }));
    expect(w.weight).toBeCloseTo(0.85 * 0.95, 10);
  });

  it('decays an old price', () => {
    const w = weighComparable(comp({ ageInDays: 400 }));
    expect(w.recency).toBe(0.4);
    expect(w.weight).toBeCloseTo(1 * 0.95 * 0.4, 10);
  });

  it('takes the asking discount off an advertised price, because asking is not selling', () => {
    const w = weighComparable(comp({ evidenceType: 'advertisedUsed', price: 10000 }));
    expect(w.adjustedPrice).toBe(9000);
  });

  it('leaves a sold price alone', () => {
    expect(weighComparable(comp({ price: 10000 })).adjustedPrice).toBe(10000);
  });

  it('marks a higher specification comparable down and a lower one up', () => {
    expect(weighComparable(comp({ adjustmentPct: -0.2 })).adjustedPrice).toBe(8000);
    expect(weighComparable(comp({ adjustmentPct: 0.15 })).adjustedPrice).toBe(11500);
  });

  it('gives a new retail price no weight at all, because it is reference only', () => {
    expect(weighComparable(comp({ evidenceType: 'newRetail' })).weight).toBe(0);
  });

  it('gives an insufficient match no weight', () => {
    expect(weighComparable(comp({ matchLevel: 'insufficient' })).weight).toBe(0);
  });

  it('keeps the figures of an excluded comparable but drops its weight', () => {
    const w = weighComparable(comp({ excluded: true }));
    expect(w.weight).toBe(0);
    // DS17 shows the valuation before and after, so the price must survive.
    expect(w.adjustedPrice).toBe(10000);
  });
});

describe('the minimum evidence rule', () => {
  it('shows no scenario below three comparables', () => {
    const result = valueComparables({ comparables: [comp(), comp()] });
    expect(result.hasEnoughEvidence).toBe(false);
    expect(result.scenarios).toEqual({ conservative: null, expected: null, optimistic: null });
  });

  it('shows no scenario when three comparables carry too little weight', () => {
    // Three similar alternatives at 0.4, all over a year old at 0.4, on an
    // advertised price at 0.6. Combined weight well under 1.5.
    const weak = () =>
      comp({ matchLevel: 'similarAlternative', evidenceType: 'advertisedUsed', ageInDays: 400 });
    const result = valueComparables({ comparables: [weak(), weak(), weak()] });
    expect(result.counted.length).toBe(MINIMUM_COMPARABLES);
    expect(result.combinedWeight).toBeLessThan(MINIMUM_COMBINED_WEIGHT);
    expect(result.hasEnoughEvidence).toBe(false);
  });

  it('shows a scenario once both parts of the rule are met', () => {
    const result = valueComparables({ comparables: [comp(), comp(), comp()] });
    expect(result.combinedWeight).toBeGreaterThanOrEqual(MINIMUM_COMBINED_WEIGHT);
    expect(result.hasEnoughEvidence).toBe(true);
    expect(result.scenarios.expected).not.toBeNull();
  });

  it('does not count an excluded comparable towards the three', () => {
    const result = valueComparables({
      comparables: [comp(), comp(), comp({ excluded: true })],
    });
    expect(result.counted.length).toBe(2);
    expect(result.hasEnoughEvidence).toBe(false);
  });
});

describe('the three scenarios', () => {
  const prices = [8000, 10000, 12000, 14000, 16000];
  const result = valueComparables({ comparables: prices.map((price) => comp({ price })) });

  it('rises from conservative through expected to optimistic', () => {
    const { conservative, expected, optimistic } = result.scenarios;
    expect(conservative).not.toBeNull();
    expect(conservative!).toBeLessThanOrEqual(expected!);
    expect(expected!).toBeLessThanOrEqual(optimistic!);
  });

  it('returns prices a real comparable actually carried', () => {
    for (const value of Object.values(result.scenarios)) {
      expect(prices).toContain(value);
    }
  });

  it('puts the conservative figure in the lower half', () => {
    expect(result.scenarios.conservative!).toBeLessThanOrEqual(12000);
  });

  it('follows the weight, not the count', () => {
    // Four weak high prices against one strong low one. The strong comparable
    // carries more weight than all four together, so it holds the median down.
    const strong = comp({ price: 5000, matchLevel: 'exact', evidenceType: 'verifiedOutcome' });
    const weak = () =>
      comp({ price: 20000, matchLevel: 'similarAlternative', evidenceType: 'advertisedUsed' });
    const weighted = valueComparables({ comparables: [strong, weak(), weak(), weak(), weak()] });
    // The strong comparable alone carries 1.0 of the 1.96 total, so it holds
    // the median even though four higher prices outnumber it.
    expect(weighted.hasEnoughEvidence).toBe(true);
    expect(weighted.scenarios.expected).toBe(5000);
  });
});

describe('D20, conservative by default', () => {
  it('never returns a conservative figure above the expected one', () => {
    // The default bid is built on conservative, so this ordering protects the
    // user from bidding on optimism.
    for (const spread of [[1000, 2000, 3000], [5000, 5000, 5000], [100, 9000, 9500, 9800]]) {
      const result = valueComparables({ comparables: spread.map((price) => comp({ price })) });
      expect(result.scenarios.conservative!).toBeLessThanOrEqual(result.scenarios.expected!);
    }
  });
});
