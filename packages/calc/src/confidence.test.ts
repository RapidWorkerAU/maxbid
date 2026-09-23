import { describe, expect, it } from 'vitest';
import { COMPONENT_WEIGHTS, bandForScore, confidenceFor } from './confidence';
import { valueComparables, type Comparable } from './valuation';

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

const strongEvidence = () =>
  valueComparables({ comparables: [comp(), comp(), comp(), comp(), comp()] });

describe('the component weights', () => {
  it('sum to one, as the spec table says', () => {
    const total = Object.values(COMPONENT_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBeCloseTo(1, 10);
  });
});

describe('the bands', () => {
  it('match the spec, including at the edges', () => {
    expect(bandForScore(100)).toBe('high');
    expect(bandForScore(75)).toBe('high');
    expect(bandForScore(74)).toBe('medium');
    expect(bandForScore(50)).toBe('medium');
    expect(bandForScore(49)).toBe('low');
    expect(bandForScore(25)).toBe('low');
    expect(bandForScore(24)).toBe('insufficient');
  });
});

describe('confidence', () => {
  it('is high when the evidence is strong and the identification confirmed', () => {
    const result = confidenceFor({
      valuation: strongEvidence(),
      identificationConfidence: 60,
      identificationConfirmed: true,
    });
    expect(result.breakdown.identification).toBe(100);
    expect(result.label).toBe('high');
  });

  it('raises identification to 100 when the user confirms it, per F19', () => {
    const low = confidenceFor({ valuation: strongEvidence(), identificationConfidence: 20 });
    const confirmed = confidenceFor({
      valuation: strongEvidence(),
      identificationConfidence: 20,
      identificationConfirmed: true,
    });
    expect(confirmed.score).toBeGreaterThan(low.score);
  });

  it('is insufficient whatever the components say when the evidence rule fails', () => {
    // Two perfect comparables and a confirmed identification still cannot
    // clear the minimum evidence rule, and F26 stops a system bid appearing.
    const thin = valueComparables({ comparables: [comp(), comp()] });
    const result = confidenceFor({
      valuation: thin,
      identificationConfidence: 100,
      identificationConfirmed: true,
    });
    expect(thin.hasEnoughEvidence).toBe(false);
    expect(result.label).toBe('insufficient');
  });

  it('rewards sold evidence over asking prices', () => {
    const sold = valueComparables({
      comparables: [comp(), comp(), comp(), comp()],
    });
    const asking = valueComparables({
      comparables: Array.from({ length: 4 }, () => comp({ evidenceType: 'advertisedUsed' })),
    });
    const withSold = confidenceFor({ valuation: sold, identificationConfidence: 80 });
    const withAsking = confidenceFor({ valuation: asking, identificationConfidence: 80 });
    expect(withSold.breakdown.soldShare).toBe(100);
    expect(withAsking.breakdown.soldShare).toBe(0);
    expect(withSold.score).toBeGreaterThan(withAsking.score);
  });

  it('rewards prices that agree with each other', () => {
    const tight = valueComparables({
      comparables: [10000, 10100, 9900, 10050].map((price) => comp({ price })),
    });
    const scattered = valueComparables({
      comparables: [2000, 9000, 18000, 40000].map((price) => comp({ price })),
    });
    const a = confidenceFor({ valuation: tight, identificationConfidence: 80 });
    const b = confidenceFor({ valuation: scattered, identificationConfidence: 80 });
    expect(a.breakdown.priceAgreement).toBeGreaterThan(b.breakdown.priceAgreement);
    expect(a.score).toBeGreaterThan(b.score);
  });

  it('rewards more evidence, up to the cap', () => {
    const three = valueComparables({ comparables: [comp(), comp(), comp()] });
    const eight = valueComparables({ comparables: Array.from({ length: 8 }, () => comp()) });
    const a = confidenceFor({ valuation: three, identificationConfidence: 80 });
    const b = confidenceFor({ valuation: eight, identificationConfidence: 80 });
    expect(b.breakdown.evidenceVolume).toBe(100);
    expect(b.score).toBeGreaterThanOrEqual(a.score);
  });

  it('rewards a better match level', () => {
    const exact = valueComparables({ comparables: [comp(), comp(), comp(), comp()] });
    const loose = valueComparables({
      comparables: Array.from({ length: 6 }, () => comp({ matchLevel: 'similarAlternative' })),
    });
    const a = confidenceFor({ valuation: exact, identificationConfidence: 80 });
    const b = confidenceFor({ valuation: loose, identificationConfidence: 80 });
    expect(a.breakdown.bestMatch).toBe(100);
    expect(b.breakdown.bestMatch).toBeCloseTo(40, 10);
  });

  it('never leaves the 0 to 100 range', () => {
    for (const identification of [-50, 0, 50, 100, 500]) {
      const result = confidenceFor({
        valuation: strongEvidence(),
        identificationConfidence: identification,
      });
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });
});
