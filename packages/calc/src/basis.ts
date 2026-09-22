// Steps 1 to 3 of docs/02-specs/bid-calculation.md.

import type { BidBasis, BidInputs } from './types';

/** The GST rate. Hard coded by CS03. A legislative change is handled by a code release. */
export const GST_RATE = 0.1;

/**
 * Works out the net resale, the effective other costs and k, the cost of each
 * dollar of hammer price.
 *
 * A registered buyer claims the GST back, so it is not a cost to them. An
 * unregistered buyer cannot, so for them the GST on the hammer and on the
 * premium is a real cost and it lands in k.
 */
export function bidBasis(i: BidInputs): BidBasis {
  const g = GST_RATE;
  const netResale = i.gstRegistered && i.resaleIncludesGst ? i.resale / (1 + g) : i.resale;
  const effectiveOtherCosts =
    i.gstRegistered && i.otherCostsIncludeGst ? i.otherCosts / (1 + g) : i.otherCosts;
  const hammerFactor = 1 + (!i.gstRegistered && i.gstOnHammer ? g : 0);
  const premiumFactor = i.premiumRate * (1 + (!i.gstRegistered && i.gstOnPremium ? g : 0));
  return { netResale, effectiveOtherCosts, costPerHammerDollar: hammerFactor + premiumFactor };
}
