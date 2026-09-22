// Where a chosen hammer bid leaves the buyer.
// Formulas 2 to 5 of decision record 0004. Source: docs/02-specs/bid-calculation.md.

import { GST_RATE, bidBasis } from './basis';
import type { BidInputs, Position } from './types';

/**
 * The money that actually leaves the buyer's account on the day.
 *
 * This uses the costs as the user entered them, not the effective costs,
 * because the GST is paid first and only claimed back later.
 */
export function cashNeeded(i: BidInputs, hammer: number): number {
  const g = GST_RATE;
  const onHammer = hammer * (1 + (i.gstOnHammer ? g : 0));
  const onPremium = hammer * i.premiumRate * (1 + (i.gstOnPremium ? g : 0));
  return onHammer + onPremium + i.otherCosts;
}

/** The GST the buyer can claim back. Always zero for a buyer who is not registered. */
export function gstCredits(i: BidInputs, hammer: number): number {
  if (!i.gstRegistered) return 0;
  const g = GST_RATE;
  const onHammer = i.gstOnHammer ? hammer * g : 0;
  const onPremium = i.gstOnPremium ? hammer * i.premiumRate * g : 0;
  const onCosts = i.otherCostsIncludeGst ? i.otherCosts - i.otherCosts / (1 + g) : 0;
  return onHammer + onPremium + onCosts;
}

/** What the lot really costs once the GST credits come back. */
export function costAfterGstCredits(i: BidInputs, hammer: number): number {
  return cashNeeded(i, hammer) - gstCredits(i, hammer);
}

/** Estimated profit at a given hammer bid. */
export function estimatedProfit(i: BidInputs, hammer: number): number {
  return bidBasis(i).netResale - costAfterGstCredits(i, hammer);
}

/** Return on cost at a given hammer bid, as a fraction. */
export function returnOnCost(i: BidInputs, hammer: number): number {
  const cost = costAfterGstCredits(i, hammer);
  return cost === 0 ? 0 : estimatedProfit(i, hammer) / cost;
}

/** Everything the calculator panel and the bid slider readout need. */
export function positionAt(i: BidInputs, hammer: number): Position {
  const cash = cashNeeded(i, hammer);
  const credits = gstCredits(i, hammer);
  const cost = cash - credits;
  const profit = bidBasis(i).netResale - cost;
  return {
    cashNeeded: cash,
    gstCredits: credits,
    costAfterGstCredits: cost,
    estimatedProfit: profit,
    returnOnCost: cost === 0 ? 0 : profit / cost,
  };
}
