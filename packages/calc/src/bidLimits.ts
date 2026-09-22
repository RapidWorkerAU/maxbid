// Bid limit maths. Source: workbook tab 10. This is the only place these formulas may live.

export const GST_RATE = 0.1;

export type BidInputs = {
  /** Expected resale price for the chosen scenario. */
  resale: number;
  resaleIncludesGst: boolean;
  /** Buyer's premium as a fraction, for example 0.165. */
  premiumRate: number;
  gstOnHammer: boolean;
  gstOnPremium: boolean;
  /** Transport, repairs, fees and other costs added together. */
  otherCosts: number;
  otherCostsIncludeGst: boolean;
  gstRegistered: boolean;
};

export type BidLimits = {
  targetBid: number;
  absoluteMax: number;
  breakEven: number;
  costPerHammerDollar: number;
  netResale: number;
  effectiveOtherCosts: number;
};

function basics(i: BidInputs) {
  const g = GST_RATE;
  const netResale = i.gstRegistered && i.resaleIncludesGst ? i.resale / (1 + g) : i.resale;
  const effectiveOtherCosts =
    i.gstRegistered && i.otherCostsIncludeGst ? i.otherCosts / (1 + g) : i.otherCosts;
  const hammerFactor = 1 + (i.gstRegistered ? 0 : i.gstOnHammer ? g : 0);
  const premiumFactor = i.premiumRate * (1 + (i.gstRegistered ? 0 : i.gstOnPremium ? g : 0));
  return { netResale, effectiveOtherCosts, k: hammerFactor + premiumFactor };
}

/** Bid limits when profit targets are dollar amounts. */
export function bidLimits(i: BidInputs, targetProfit: number, minProfit: number): BidLimits {
  const { netResale, effectiveOtherCosts, k } = basics(i);
  const limit = (profit: number) => Math.max(0, (netResale - effectiveOtherCosts - profit) / k);
  return {
    targetBid: limit(targetProfit),
    absoluteMax: limit(minProfit),
    breakEven: limit(0),
    costPerHammerDollar: k,
    netResale,
    effectiveOtherCosts,
  };
}

/** Highest hammer bid that still returns the given fraction on cost, for example 0.25. */
export function bidForReturn(i: BidInputs, returnOnCost: number): number {
  const { netResale, effectiveOtherCosts, k } = basics(i);
  return Math.max(0, (netResale - effectiveOtherCosts * (1 + returnOnCost)) / (k * (1 + returnOnCost)));
}

/** Estimated profit at a given hammer bid. */
export function profitAt(i: BidInputs, hammer: number): number {
  const { netResale, effectiveOtherCosts, k } = basics(i);
  return netResale - (hammer * k + effectiveOtherCosts);
}
