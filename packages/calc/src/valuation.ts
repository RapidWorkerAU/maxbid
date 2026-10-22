// Turns a set of comparables into three resale scenarios.
// Source: docs/02-specs/matching-and-valuation.md.

import { weightedPercentile, type WeightedValue } from './percentile';
import {
  AUCTION_MARKET_EVIDENCE,
  DEFAULT_ASKING_DISCOUNT,
  EVIDENCE_WEIGHTS,
  MATCH_WEIGHTS,
  MINIMUM_COMBINED_WEIGHT,
  MINIMUM_COMPARABLES,
  RESALE_EVIDENCE,
  recencyWeight,
  type EvidenceType,
} from './weights';
import type { MatchLevel } from './types';

export type Comparable = {
  id: string;
  price: number;
  matchLevel: MatchLevel;
  evidenceType: EvidenceType;
  /** How old the price is, in days. */
  ageInDays: number;
  /**
   * A price adjustment from match grading, as a fraction. Negative marks a
   * higher specification comparable down, positive marks a lower one up.
   */
  adjustmentPct?: number;
  /** Excluded by the user, with a reason. F62. */
  excluded?: boolean;
};

export type WeightedComparable = Comparable & {
  /** The price after the asking discount and any match adjustment. */
  adjustedPrice: number;
  matchWeight: number;
  evidenceWeight: number;
  recency: number;
  /** Match weight multiplied by evidence weight multiplied by recency. */
  weight: number;
};

export type Scenarios = {
  conservative: number | null;
  expected: number | null;
  optimistic: number | null;
};

export type ValuationInput = {
  comparables: Comparable[];
  /** Per category, editable in admin. Defaults to 10 percent. */
  askingDiscount?: number;
};

/**
 * Works out one comparable's adjusted price and its combined weight.
 *
 * The asking discount comes off an advertised price first, because an asking
 * price is not a sale. Then the match adjustment, then the weights multiply.
 */
export function weighComparable(
  comparable: Comparable,
  askingDiscount = DEFAULT_ASKING_DISCOUNT,
): WeightedComparable {
  const discount = comparable.evidenceType === 'advertisedUsed' ? 1 - askingDiscount : 1;
  const adjustment = 1 + (comparable.adjustmentPct ?? 0);
  const adjustedPrice = Math.max(0, comparable.price * discount * adjustment);

  const matchWeight = MATCH_WEIGHTS[comparable.matchLevel];
  const evidenceWeight = EVIDENCE_WEIGHTS[comparable.evidenceType];
  const recency = recencyWeight(comparable.ageInDays);

  return {
    ...comparable,
    adjustedPrice,
    matchWeight,
    evidenceWeight,
    recency,
    // An excluded comparable keeps its figures for the before and after in
    // DS17, but carries no weight in the valuation.
    weight: comparable.excluded ? 0 : matchWeight * evidenceWeight * recency,
  };
}

/** What the same thing has been fetching at auction, which is not its resale. */
export type AuctionMarket = {
  low: number;
  typical: number;
  high: number;
  /** How many past results this rests on. */
  results: number;
};

export type Valuation = {
  weighted: WeightedComparable[];
  /** The comparables that actually count towards the scenarios. */
  counted: WeightedComparable[];
  combinedWeight: number;
  /** True when there is enough evidence to show a range at all. */
  hasEnoughEvidence: boolean;
  scenarios: Scenarios;
  /**
   * What it takes to win one of these at auction, where we know.
   *
   * A separate answer to a separate question. It never becomes the resale
   * range, because a hammer price is what a reseller paid rather than what
   * the public paid, and the gap between the two is the margin.
   */
  auctionMarket: AuctionMarket | null;
};

const pointsOf = (list: WeightedComparable[]): WeightedValue[] =>
  list.map((c) => ({ value: c.adjustedPrice, weight: c.weight }));

/** What these have been fetching at auction, from past results alone. */
function auctionMarketFrom(counted: WeightedComparable[]): AuctionMarket | null {
  const results = counted.filter((c) => AUCTION_MARKET_EVIDENCE.includes(c.evidenceType));
  if (results.length === 0) return null;

  const points = pointsOf(results);
  const low = weightedPercentile(points, 0.25);
  const typical = weightedPercentile(points, 0.5);
  const high = weightedPercentile(points, 0.75);
  // All three or none. Two ends and no middle is not a range, and a floor we
  // cannot state is a floor we must not apply.
  if (low === null || typical === null || high === null) return null;

  return { low, typical, high, results: results.length };
}

/**
 * The three resale scenarios, and separately what it takes to win one.
 *
 * **Only resale evidence builds the resale range.** matching-and-valuation.md
 * gives every evidence type a "Used for" column and an auction result says
 * "Resale floor and auction market" where the others say "Resale". That
 * distinction was not implemented: every comparable went into one average, so
 * a hammer price counted as a resale price at the joint highest weight.
 *
 * It matters because the two are prices in different markets. A hammer price
 * is what a reseller paid to buy and a resale price is what the public paid
 * to own, and the gap between them is the margin this product exists to find.
 * Averaging them together removed the thing being measured: a bid worked out
 * that way landed below what the item demonstrably fetched in the same room,
 * which is both useless and reads as though the item is worth less than it
 * is. It is why the first real measurement put the median maximum bid at 0.71
 * times the hammer price.
 *
 * Returns nulls rather than numbers when the minimum evidence rule is not
 * met. F26 says an insufficient lot shows no system bid, so there must be no
 * figure to show by accident. The rule counts the evidence the range is built
 * from, because evidence that does not build it cannot vouch for it.
 */
export function valueComparables({
  comparables,
  askingDiscount = DEFAULT_ASKING_DISCOUNT,
}: ValuationInput): Valuation {
  const weighted = comparables.map((c) => weighComparable(c, askingDiscount));
  const counted = weighted.filter((c) => c.weight > 0);
  const combinedWeight = counted.reduce((sum, c) => sum + c.weight, 0);
  const auctionMarket = auctionMarketFrom(counted);

  const forResale = counted.filter((c) => RESALE_EVIDENCE.includes(c.evidenceType));
  const resaleWeight = forResale.reduce((sum, c) => sum + c.weight, 0);

  const hasEnoughEvidence =
    forResale.length >= MINIMUM_COMPARABLES && resaleWeight >= MINIMUM_COMBINED_WEIGHT;

  if (!hasEnoughEvidence) {
    return {
      weighted,
      counted,
      combinedWeight,
      hasEnoughEvidence: false,
      scenarios: { conservative: null, expected: null, optimistic: null },
      auctionMarket,
    };
  }

  const points = pointsOf(forResale);
  const conservative = weightedPercentile(points, 0.25);

  return {
    weighted,
    counted,
    combinedWeight,
    hasEnoughEvidence: true,
    scenarios: {
      // The floor. Nobody resells to the public for less than resellers are
      // paying each other in the saleroom, so a retail estimate below the
      // auction price is the retail evidence being wrong rather than a
      // bargain. Raising it is the honest reading, and only the cautious end
      // moves, because the floor says what cannot be below it rather than
      // what the item is worth.
      conservative:
        conservative !== null && auctionMarket
          ? Math.max(conservative, auctionMarket.typical)
          : conservative,
      expected: weightedPercentile(points, 0.5),
      optimistic: weightedPercentile(points, 0.75),
    },
    auctionMarket,
  };
}
