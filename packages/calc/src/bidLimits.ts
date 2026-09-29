// The three bid figures. Source: docs/02-specs/bid-calculation.md.
// Names set by decision record 0002. The premium schedule by decision record
// 0015. This is the only place these formulas may live.

import { bidBasis, costAtHammer } from './basis';
import { assertValidSchedule, bandRanges } from './premium';
import type { BidInputs, BidLimits } from './types';

/** No bid figure is ever less than zero. Step 7 of the spec. */
function atLeastZero(value: number): number {
  return Math.max(0, value);
}

/** Money arrives from division carrying floating point noise. */
const TOLERANCE = 1e-9;

/**
 * The highest hammer price whose total cost is still within a budget.
 *
 * Every bid figure is this question with a different budget, so the band
 * walking lives here once.
 *
 * Within one band the cost is a straight line, so the answer is one division.
 * Across bands it is not, and it does not even always rise. On the real Grays
 * schedule a $10,000 hammer carries a fixed $710 premium while $10,001 carries
 * 7 percent, which is $700.07, so bidding a dollar more costs nine dollars
 * less. A search that assumed cost rises with price would walk past that.
 *
 * So every band is solved in turn. A band's answer is kept only if it lands
 * inside that band, and a band whose answer runs off the top is pinned to its
 * top edge, which is the most that band can offer. The highest survivor wins.
 */
export function highestBidForCost(i: BidInputs, budget: number): number {
  assertValidSchedule(i.premium);
  const basis = bidBasis(i);
  let best = 0;

  for (const { band, from, to } of bandRanges(i.premium)) {
    const solved =
      band.kind === 'fixed'
        ? (budget - basis.effectiveOtherCosts - band.amount * basis.premiumFactor) /
          basis.hammerFactor
        : (budget - basis.effectiveOtherCosts) /
          (basis.hammerFactor + band.rate * basis.premiumFactor);

    // Pin the answer to the band it was worked out for. Below the band it is
    // not this band's answer at all, and the check below throws it out. Above
    // the band, this band cannot offer more than its own top edge.
    const candidate = Math.min(Math.max(solved, from), to ?? solved);

    // Prove it rather than trust it. The cost here is worked out from the
    // schedule, so a candidate that has been pinned into the wrong band is
    // caught by its own price.
    if (candidate >= 0 && costAtHammer(i, candidate) <= budget + TOLERANCE) {
      best = Math.max(best, candidate);
    }
  }

  return atLeastZero(best);
}

/**
 * The three bid figures when the profit targets are dollar amounts.
 * Steps 4 to 6 of the spec.
 */
export function bidLimits(i: BidInputs, targetProfit: number, minProfit: number): BidLimits {
  const basis = bidBasis(i);
  const bidFor = (profit: number) => highestBidForCost(i, basis.netResale - profit);
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
 *
 * A profit of r times the cost means the resale covers the cost plus that
 * profit, so the cost may be at most the net resale divided by 1 plus r.
 */
export function bidForReturn(i: BidInputs, returnOnCost: number): number {
  const basis = bidBasis(i);
  return highestBidForCost(i, basis.netResale / (1 + returnOnCost));
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
