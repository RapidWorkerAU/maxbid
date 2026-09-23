// Match levels, evidence types and recency decay.
// Source: docs/02-specs/matching-and-valuation.md.
//
// CS04 to CS06 make these hard coded and versioned. They change only through
// a released version with a public changelog, never through a setting.

import type { MatchLevel } from './types';

/** How much a comparable counts, by how well it matches the lot. */
export const MATCH_WEIGHTS: Record<MatchLevel, number> = {
  exact: 1,
  nearExact: 0.85,
  higherSpec: 0.6,
  lowerSpec: 0.6,
  similarAlternative: 0.4,
  insufficient: 0,
};

/** Where the price came from. Sold evidence counts for more than asking prices. */
export type EvidenceType =
  | 'verifiedOutcome'
  | 'auctionResult'
  | 'marketplaceSold'
  | 'pooledOutcome'
  | 'advertisedUsed'
  | 'userSupplied'
  | 'newRetail';

export const EVIDENCE_WEIGHTS: Record<EvidenceType, number> = {
  verifiedOutcome: 1,
  auctionResult: 0.95,
  marketplaceSold: 0.95,
  pooledOutcome: 0.85,
  advertisedUsed: 0.6,
  userSupplied: 0.5,
  // Reference only. A new price never contributes to a resale estimate.
  newRetail: 0,
};

/** Evidence types that count as sold, for the confidence score. */
export const SOLD_EVIDENCE: EvidenceType[] = [
  'verifiedOutcome',
  'auctionResult',
  'marketplaceSold',
  'pooledOutcome',
];

/** Older evidence says less about today's market. */
export function recencyWeight(ageInDays: number): number {
  if (ageInDays <= 90) return 1;
  if (ageInDays <= 180) return 0.8;
  if (ageInDays <= 365) return 0.6;
  return 0.4;
}

/** The default reduction on an advertised price, because asking is not selling. */
export const DEFAULT_ASKING_DISCOUNT = 0.1;

/** At least three comparables carrying this much weight before a range is shown. */
export const MINIMUM_COMPARABLES = 3;
export const MINIMUM_COMBINED_WEIGHT = 1.5;
