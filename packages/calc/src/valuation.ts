// Turns a set of comparables into three resale scenarios.
// Source: docs/02-specs/matching-and-valuation.md.

import { weightedPercentile, type WeightedValue } from './percentile';
import {
  DEFAULT_ASKING_DISCOUNT,
  EVIDENCE_WEIGHTS,
  MATCH_WEIGHTS,
  MINIMUM_COMBINED_WEIGHT,
  MINIMUM_COMPARABLES,
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

export type Valuation = {
  weighted: WeightedComparable[];
  /** The comparables that actually count towards the scenarios. */
  counted: WeightedComparable[];
  combinedWeight: number;
  /** True when there is enough evidence to show a range at all. */
  hasEnoughEvidence: boolean;
  scenarios: Scenarios;
};

/**
 * The three resale scenarios.
 *
 * Returns nulls rather than numbers when the minimum evidence rule is not
 * met. F26 says an insufficient lot shows no system bid, so there must be no
 * figure to show by accident.
 */
export function valueComparables({
  comparables,
  askingDiscount = DEFAULT_ASKING_DISCOUNT,
}: ValuationInput): Valuation {
  const weighted = comparables.map((c) => weighComparable(c, askingDiscount));
  const counted = weighted.filter((c) => c.weight > 0);
  const combinedWeight = counted.reduce((sum, c) => sum + c.weight, 0);

  const hasEnoughEvidence =
    counted.length >= MINIMUM_COMPARABLES && combinedWeight >= MINIMUM_COMBINED_WEIGHT;

  if (!hasEnoughEvidence) {
    return {
      weighted,
      counted,
      combinedWeight,
      hasEnoughEvidence: false,
      scenarios: { conservative: null, expected: null, optimistic: null },
    };
  }

  const points: WeightedValue[] = counted.map((c) => ({
    value: c.adjustedPrice,
    weight: c.weight,
  }));

  return {
    weighted,
    counted,
    combinedWeight,
    hasEnoughEvidence: true,
    scenarios: {
      conservative: weightedPercentile(points, 0.25),
      expected: weightedPercentile(points, 0.5),
      optimistic: weightedPercentile(points, 0.75),
    },
  };
}
