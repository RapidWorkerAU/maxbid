// Shared types for the bid engine. Source: docs/02-specs/bid-calculation.md.

import type { PremiumSchedule } from './premium';

/** Everything the bid maths needs to know about one lot. */
export type BidInputs = {
  /** Resale price for the chosen scenario, usually the conservative resale. */
  resale: number;
  resaleIncludesGst: boolean;
  /**
   * How this auction charges its buyer's premium. Use flatRate(0.165) for an
   * auction that charges one percentage at every price. Decision record 0015.
   */
  premium: PremiumSchedule;
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
  /**
   * What each dollar of hammer price costs before the premium. 1 for a GST
   * registered buyer, 1.1 for an unregistered buyer paying GST on the hammer.
   */
  hammerFactor: number;
  /** The same, applied to the premium rather than to the hammer price. */
  premiumFactor: number;
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
