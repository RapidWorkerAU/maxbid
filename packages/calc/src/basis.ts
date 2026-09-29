// Steps 1 to 3 of docs/02-specs/bid-calculation.md.

import { premiumAt } from './premium';
import type { BidBasis, BidInputs } from './types';

/** The GST rate. Hard coded by CS03. A legislative change is handled by a code release. */
export const GST_RATE = 0.1;

/**
 * Works out the net resale, the effective other costs, and what each dollar of
 * hammer price and each dollar of premium really costs.
 *
 * A registered buyer claims the GST back, so it is not a cost to them. An
 * unregistered buyer cannot, so for them the GST on the hammer and on the
 * premium is a real cost and it lands in these factors.
 */
export function bidBasis(i: BidInputs): BidBasis {
  const g = GST_RATE;
  return {
    netResale: i.gstRegistered && i.resaleIncludesGst ? i.resale / (1 + g) : i.resale,
    effectiveOtherCosts:
      i.gstRegistered && i.otherCostsIncludeGst ? i.otherCosts / (1 + g) : i.otherCosts,
    hammerFactor: 1 + (!i.gstRegistered && i.gstOnHammer ? g : 0),
    premiumFactor: 1 + (!i.gstRegistered && i.gstOnPremium ? g : 0),
  };
}

/**
 * What a lot costs at a given hammer price, after any GST credits.
 *
 * This is the figure every bid limit is solved against. It is not a straight
 * line: the premium schedule steps at each band edge, so the cost steps with
 * it, and it can even fall as the hammer price rises. See bidLimits.
 */
export function costAtHammer(i: BidInputs, hammer: number): number {
  const basis = bidBasis(i);
  return (
    hammer * basis.hammerFactor +
    premiumAt(i.premium, hammer) * basis.premiumFactor +
    basis.effectiveOtherCosts
  );
}

/**
 * Known as k in the spec: the cost of one more dollar of hammer price.
 *
 * Only meaningful inside a band. On a band charging a fixed dollar premium the
 * premium does not move with the hammer price at all, so k is just the hammer
 * factor. Use this to explain a figure, not to work one out.
 */
export function costPerHammerDollarAt(i: BidInputs, hammer: number): number {
  const basis = bidBasis(i);
  const band = i.premium.bands.find((b) => b.upTo === null || hammer <= b.upTo);
  if (!band || band.kind === 'fixed') return basis.hammerFactor;
  return basis.hammerFactor + band.rate * basis.premiumFactor;
}
