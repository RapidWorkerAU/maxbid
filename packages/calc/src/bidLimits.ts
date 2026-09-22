// The three bid figures. Source: docs/02-specs/bid-calculation.md.
// Names set by decision record 0002. This is the only place these formulas may live.

import { bidBasis } from './basis';
import type { BidInputs, BidLimits } from './types';

/** No bid figure is ever less than zero. Step 7 of the spec. */
function atLeastZero(value: number): number {
  return Math.max(0, value);
}

/**
 * The three bid figures when the profit targets are dollar amounts.
 * Steps 4 to 6 of the spec.
 */
export function bidLimits(i: BidInputs, targetProfit: number, minProfit: number): BidLimits {
  const basis = bidBasis(i);
  const bidFor = (profit: number) =>
    atLeastZero(
      (basis.netResale - basis.effectiveOtherCosts - profit) / basis.costPerHammerDollar,
    );
  return {
    ...basis,
    targetBid: bidFor(targetProfit),
    limitBid: bidFor(minProfit),
    breakEvenBid: bidFor(0),
  };
}

/**
 * The highest hammer bid that still returns the given fraction on cost, for
 * example 0.25 for a 25 percent return. Formula 1 of decision record 0004.
 */
export function bidForReturn(i: BidInputs, returnOnCost: number): number {
  const basis = bidBasis(i);
  const r = 1 + returnOnCost;
  return atLeastZero(
    (basis.netResale - basis.effectiveOtherCosts * r) / (basis.costPerHammerDollar * r),
  );
}

/**
 * The three bid figures when the profit targets are returns on cost rather
 * than dollar amounts. The break even bid is the same either way, because a
 * return of zero is the same as a profit of zero.
 */
export function bidLimitsForReturn(
  i: BidInputs,
  targetReturn: number,
  minReturn: number,
): BidLimits {
  return {
    ...bidBasis(i),
    targetBid: bidForReturn(i, targetReturn),
    limitBid: bidForReturn(i, minReturn),
    breakEvenBid: bidForReturn(i, 0),
  };
}
