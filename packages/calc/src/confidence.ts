// The confidence score, 0 to 100, and its four bands.
// Source: docs/02-specs/matching-and-valuation.md.
//
// Five components weighted to sum to 1. CS07 makes this hard coded and
// versioned, and D52 makes it visible to users, so every part of it has to be
// explainable in the How this was calculated expander.

import { weightedCoefficientOfVariation } from './percentile';
import { MATCH_WEIGHTS, SOLD_EVIDENCE } from './weights';
import type { ConfidenceLabel } from './types';
import type { Valuation, WeightedComparable } from './valuation';

export const COMPONENT_WEIGHTS = {
  identification: 0.25,
  bestMatch: 0.25,
  evidenceVolume: 0.2,
  soldShare: 0.15,
  priceAgreement: 0.15,
} as const;

/** Combined weight is capped here before being scaled to 100. */
export const EVIDENCE_VOLUME_CAP = 5;

export type ConfidenceInput = {
  valuation: Valuation;
  /** 0 to 100. Raised to 100 when the user confirms the identification. */
  identificationConfidence: number;
  /** F19. A confirmed identification is certain by definition. */
  identificationConfirmed?: boolean;
};

export type ConfidenceBreakdown = {
  identification: number;
  bestMatch: number;
  evidenceVolume: number;
  soldShare: number;
  priceAgreement: number;
};

export type Confidence = {
  /** 0 to 100, rounded to a whole number for display. */
  score: number;
  label: ConfidenceLabel;
  /** Each component's own 0 to 100 score, before its weight is applied. */
  breakdown: ConfidenceBreakdown;
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

/** High is 75 and above, medium 50 to 74, low 25 to 49, below that insufficient. */
export function bandForScore(score: number): ConfidenceLabel {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 25) return 'low';
  return 'insufficient';
}

function bestMatchScore(counted: WeightedComparable[]): number {
  const best = counted.reduce((highest, c) => Math.max(highest, MATCH_WEIGHTS[c.matchLevel]), 0);
  return best * 100;
}

function soldShareScore(counted: WeightedComparable[], combinedWeight: number): number {
  if (combinedWeight <= 0) return 0;
  const sold = counted
    .filter((c) => SOLD_EVIDENCE.includes(c.evidenceType))
    .reduce((sum, c) => sum + c.weight, 0);
  return (sold / combinedWeight) * 100;
}

function priceAgreementScore(counted: WeightedComparable[]): number {
  const cv = weightedCoefficientOfVariation(
    counted.map((c) => ({ value: c.adjustedPrice, weight: c.weight })),
  );
  // No spread to measure means nothing to disagree about.
  if (cv === null) return 100;
  return clamp(100 - cv * 100);
}

/**
 * The confidence score.
 *
 * A lot that fails the minimum evidence rule is insufficient whatever the
 * components say, because the spec bands it that way and F26 stops it showing
 * a system bid.
 */
export function confidenceFor({
  valuation,
  identificationConfidence,
  identificationConfirmed = false,
}: ConfidenceInput): Confidence {
  const { counted, combinedWeight } = valuation;

  const breakdown: ConfidenceBreakdown = {
    identification: identificationConfirmed ? 100 : clamp(identificationConfidence),
    bestMatch: bestMatchScore(counted),
    evidenceVolume: clamp((Math.min(combinedWeight, EVIDENCE_VOLUME_CAP) / EVIDENCE_VOLUME_CAP) * 100),
    soldShare: soldShareScore(counted, combinedWeight),
    priceAgreement: counted.length === 0 ? 0 : priceAgreementScore(counted),
  };

  const score =
    breakdown.identification * COMPONENT_WEIGHTS.identification +
    breakdown.bestMatch * COMPONENT_WEIGHTS.bestMatch +
    breakdown.evidenceVolume * COMPONENT_WEIGHTS.evidenceVolume +
    breakdown.soldShare * COMPONENT_WEIGHTS.soldShare +
    breakdown.priceAgreement * COMPONENT_WEIGHTS.priceAgreement;

  const rounded = Math.round(clamp(score));

  return {
    score: rounded,
    label: valuation.hasEnoughEvidence ? bandForScore(rounded) : 'insufficient',
    breakdown,
  };
}
