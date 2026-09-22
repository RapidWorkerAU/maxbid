import { describe, expect, it } from 'vitest';
import { bidBasis } from './basis';
import { bidLimits } from './bidLimits';
import { MIN_PROFIT, TARGET_PROFIT, registered, unregistered } from './examples';
import { gstCredits, positionAt } from './position';

describe('positionAt, worked example 2, GST registered at the target bid', () => {
  const { targetBid } = bidLimits(registered, TARGET_PROFIT, MIN_PROFIT);
  const position = positionAt(registered, targetBid);

  it('matches the spec to the cent', () => {
    expect(position.cashNeeded).toBeCloseTo(14100.0, 2);
    expect(position.gstCredits).toBeCloseTo(1281.82, 2);
    expect(position.costAfterGstCredits).toBeCloseTo(12818.18, 2);
    expect(position.estimatedProfit).toBeCloseTo(4000.0, 2);
  });

  it('returns 31.2 percent on cost', () => {
    expect(position.returnOnCost).toBeCloseTo(0.312057, 6);
  });

  it('delivers exactly the target profit the user asked for', () => {
    expect(position.estimatedProfit).toBeCloseTo(TARGET_PROFIT, 8);
  });
});

describe('positionAt, worked example 3, not registered at the target bid', () => {
  const { targetBid } = bidLimits(unregistered, TARGET_PROFIT, MIN_PROFIT);
  const position = positionAt(unregistered, targetBid);

  it('matches the spec to the cent', () => {
    expect(position.cashNeeded).toBeCloseTo(14500.0, 2);
    expect(position.gstCredits).toBe(0);
    expect(position.costAfterGstCredits).toBeCloseTo(14500.0, 2);
    expect(position.estimatedProfit).toBeCloseTo(4000.0, 2);
  });

  it('returns 27.6 percent on cost', () => {
    expect(position.returnOnCost).toBeCloseTo(0.275862, 6);
  });

  it('needs more cash than the registered buyer for the same profit', () => {
    const asRegistered = positionAt(
      registered,
      bidLimits(registered, TARGET_PROFIT, MIN_PROFIT).targetBid,
    );
    expect(position.cashNeeded).toBeGreaterThan(asRegistered.cashNeeded);
    expect(position.estimatedProfit).toBeCloseTo(asRegistered.estimatedProfit, 8);
  });
});

describe('the two routes to the same cost agree', () => {
  // The spec works the cost out twice: through k in the bid limits, and
  // through cash less GST credits in the position. They must never disagree.
  it.each([
    ['registered', registered],
    ['not registered', unregistered],
  ])('reconciles for a buyer who is %s', (_name, inputs) => {
    const basis = bidBasis(inputs);
    for (const hammer of [0, 1000, 7936.01, 12500]) {
      const throughK = hammer * basis.costPerHammerDollar + basis.effectiveOtherCosts;
      expect(positionAt(inputs, hammer).costAfterGstCredits).toBeCloseTo(throughK, 8);
    }
  });
});

describe('gstCredits', () => {
  it('is zero for every buyer who is not registered', () => {
    expect(gstCredits(unregistered, 7936.01)).toBe(0);
  });

  it('claims nothing on costs that were entered without GST', () => {
    const inputs = { ...registered, otherCostsIncludeGst: false };
    const onHammerAndPremium = 7936.01 * 0.1 + 7936.01 * 0.165 * 0.1;
    expect(gstCredits(inputs, 7936.01)).toBeCloseTo(onHammerAndPremium, 8);
  });

  it('claims nothing on the hammer when the auction terms say no GST applies', () => {
    const inputs = { ...registered, gstOnHammer: false, gstOnPremium: false };
    const onCostsOnly = 3930 - 3930 / 1.1;
    expect(gstCredits(inputs, 7936.01)).toBeCloseTo(onCostsOnly, 8);
  });
});

describe('estimated profit at the other two bid figures', () => {
  const limits = bidLimits(registered, TARGET_PROFIT, MIN_PROFIT);

  it('is the minimum acceptable profit at the limit bid', () => {
    expect(positionAt(registered, limits.limitBid).estimatedProfit).toBeCloseTo(MIN_PROFIT, 8);
  });

  it('is zero at the break even bid', () => {
    expect(positionAt(registered, limits.breakEvenBid).estimatedProfit).toBeCloseTo(0, 8);
    expect(positionAt(registered, limits.breakEvenBid).returnOnCost).toBeCloseTo(0, 10);
  });

  it('is a loss above the break even bid', () => {
    expect(positionAt(registered, limits.breakEvenBid + 500).estimatedProfit).toBeLessThan(0);
  });
});
