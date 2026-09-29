// Turning a resale estimate into the most a lot is worth paying.
//
// This is where everything meets: the resale range from S5, the auction's
// premium schedule from S3, and the organisation's own profit target and GST
// position. The maths itself is all in @maxbid/calc, per rule 6.
//
// Nothing here invents a figure. Decision record 0022: where the organisation
// has not said what profit it wants, there is no target bid and the screen
// says which setting is missing rather than showing a number.

import {
  bidLimits,
  bidLimitsForReturn,
  flatRate,
  type BidInputs,
  type PremiumSchedule,
} from '@maxbid/calc';
import { canShowBidFigures, type CostProfileSettings } from '@maxbid/db';

/** What the organisation has told us about itself. */
export type Buyer = {
  gstRegistered: boolean;
  profile: CostProfileSettings | null;
};

/** What the auction charges, from S3. */
export type AuctionTerms = {
  premium: PremiumSchedule | null;
  /** Whether GST sits on top of the hammer price. */
  gstOnHammer: boolean;
};

const number = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * The most a lot is worth paying, and the most before it stops being worth it.
 *
 * Returns null where anything needed is missing, rather than filling a gap.
 * Costs other than the premium are zero for now, because no cost profile
 * carries them yet, and every cost only ever makes these figures smaller. So
 * these are an upper bound and the screen has to say so.
 */
export function targetBidFor(
  resale: number,
  buyer: Buyer,
  terms: AuctionTerms,
): { targetBid: number; limitBid: number; breakEvenBid: number } | null {
  if (!canShowBidFigures(buyer.profile)) return null;
  const profile = buyer.profile!;

  const inputs: BidInputs = {
    resale,
    // A resale estimate built from Australian sale prices includes GST.
    resaleIncludesGst: true,
    // A premium we could not read is not a premium of nothing. Without one we
    // would work out a bid that ignores a real cost, so there is no bid.
    premium: terms.premium ?? flatRate(0),
    gstOnHammer: terms.gstOnHammer,
    gstOnPremium: true,
    otherCosts: 0,
    otherCostsIncludeGst: true,
    gstRegistered: buyer.gstRegistered,
  };

  if (!terms.premium) return null;

  const limits =
    profile.profit_mode === 'dollars'
      ? bidLimits(inputs, number(profile.target_profit_amount) ?? 0, number(profile.min_profit_amount) ?? 0)
      : bidLimitsForReturn(
          inputs,
          number(profile.target_return_pct) ?? 0,
          number(profile.min_return_pct) ?? 0,
        );

  return {
    targetBid: limits.targetBid,
    limitBid: limits.limitBid,
    breakEvenBid: limits.breakEvenBid,
  };
}
