// Shared types for the bid engine. Source: docs/02-specs/bid-calculation.md.

/** Everything the bid maths needs to know about one lot. */
export type BidInputs = {
  /** Resale price for the chosen scenario, usually the conservative resale. */
  resale: number;
  resaleIncludesGst: boolean;
  /** Buyer's premium as a fraction, for example 0.165. */
  premiumRate: number;
  gstOnHammer: boolean;
  gstOnPremium: boolean;
  /** Transport, repairs, fees and other costs added together, as the user entered them. */
  otherCosts: number;
  otherCostsIncludeGst: boolean;
  gstRegistered: boolean;
};

/** The three figures every bid calculation starts from. Steps 1 to 3 of the spec. */
export type BidBasis = {
  netResale: number;
  effectiveOtherCosts: number;
  /** Known as k in the spec. */
  costPerHammerDollar: number;
};

/** The three bid figures, unrounded, with the basis they were worked out from. */
export type BidLimits = BidBasis & {
  /** Highest bid that still meets the target profit. Shown as the most you should bid. */
  targetBid: number;
  /** Highest bid that still meets the minimum acceptable profit. */
  limitBid: number;
  /** The bid at which estimated profit is zero. The stop line marks this price. */
  breakEvenBid: number;
};

/** Where a chosen hammer bid leaves the buyer. */
export type Position = {
  /** Money that leaves the account on the day, before any GST credit is claimed. */
  cashNeeded: number;
  gstCredits: number;
  costAfterGstCredits: number;
  estimatedProfit: number;
  /** A fraction, not a percentage. 0.312 means 31.2 percent. */
  returnOnCost: number;
};

/** The three bid figures as they are shown on screen or written to an export. */
export type DisplayBidLimits = {
  targetBid: number;
  limitBid: number;
  breakEvenBid: number;
};

/** How well a comparable matches the lot. Source: matching-and-valuation.md. */
export type MatchLevel =
  | 'exact'
  | 'nearExact'
  | 'higherSpec'
  | 'lowerSpec'
  | 'similarAlternative'
  | 'insufficient';

/** How much confidence the evidence supports. */
export type ConfidenceLabel = 'high' | 'medium' | 'low' | 'insufficient';
