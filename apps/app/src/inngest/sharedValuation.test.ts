// Turning a fresh valuation into a range worth storing for everybody.
//
// The database reads and writes are proved by the row level security tests in
// packages/db. What is tested here is the rule for whether a range exists at
// all, and the confidence that travels with it.

import { describe, expect, it } from 'vitest';
import { valueComparables, type Comparable } from '@maxbid/calc';
import { rangeFrom, VALUATION_METHOD_VERSION } from './sharedValuation';

function comparable(over: Partial<Comparable> = {}): Comparable {
  return {
    id: crypto.randomUUID(),
    price: 20000,
    matchLevel: 'exact',
    evidenceType: 'auctionResult',
    ageInDays: 30,
    ...over,
  };
}

const strong = () =>
  valueComparables({
    comparables: [comparable(), comparable(), comparable(), comparable(), comparable()],
  });

const identified = { confidence: 90, confirmed: false };

describe('whether a range is worth storing', () => {
  it('stores one when the evidence threshold is met', () => {
    const range = rangeFrom(strong(), identified);
    expect(range).not.toBeNull();
    expect(range!.conservative).toBeLessThanOrEqual(range!.expected);
    expect(range!.expected).toBeLessThanOrEqual(range!.optimistic);
  });

  it('stores nothing when one comparable is all there is', () => {
    // F26 says a lot we cannot value shows no bid figure, so there must be no
    // range to store by accident.
    const thin = valueComparables({ comparables: [comparable()] });
    expect(rangeFrom(thin, identified)).toBeNull();
  });

  it('stores nothing when there was no valuation at all', () => {
    expect(rangeFrom(null, identified)).toBeNull();
  });

  it('records how much evidence stood behind it', () => {
    const range = rangeFrom(strong(), identified)!;
    expect(range.comparableCount).toBe(5);
    expect(range.combinedWeight).toBeGreaterThan(0);
  });
});

describe('the confidence stored with a range', () => {
  it('is a real score rather than a fixed guess', () => {
    // Before decision record 0024 there was nowhere to keep this, so every
    // valued lot counted as medium and the ranking could not tell a well
    // evidenced lot from a thin one.
    const range = rangeFrom(strong(), identified)!;
    expect(range.confidence).toBeGreaterThan(0);
    expect(range.confidence).toBeLessThanOrEqual(100);
  });

  it('is higher for a lot somebody confirmed than for a doubtful one', () => {
    const confirmed = rangeFrom(strong(), { confidence: 40, confirmed: true })!;
    const doubtful = rangeFrom(strong(), { confidence: 40, confirmed: false })!;
    expect(confirmed.confidence).toBeGreaterThan(doubtful.confidence);
  });

  it('treats an unknown identification confidence as nought, not as certain', () => {
    // Number(null) is 0 but undefined is not, and a missing confidence read as
    // certainty is how a guess gets promoted to a fact.
    const unknown = rangeFrom(strong(), { confidence: null, confirmed: false })!;
    const certain = rangeFrom(strong(), { confidence: 100, confirmed: false })!;
    expect(unknown.confidence).toBeLessThan(certain.confidence);
  });

  it('does not depend on who is asking, because the range is shared', () => {
    const once = rangeFrom(strong(), identified)!;
    const again = rangeFrom(strong(), identified)!;
    expect(again).toEqual(once);
  });
});

describe('the method version', () => {
  it('is set, because a stored range is only reused while it matches', () => {
    expect(VALUATION_METHOD_VERSION).toBeTruthy();
  });
});
