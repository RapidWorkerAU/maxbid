// The opportunity score, which decides the order of a triage list.
// Source: docs/02-specs/matching-and-valuation.md. Decision records 0006
// and 0023.
//
// Ranks on what a lot is worth paying, not on the room between that and the
// current bid. A catalogue is analysed hours before it closes and bidders wait
// until the end: the Grays Perth sale of 29 September 2026 rose 51 per cent in
// its last six hours, and one lot went from $1,809 to $7,200. A bid taken at
// analysis time records how early we looked, not what a lot will fetch.

import type { ConfidenceLabel } from './types';

/** How much a confidence band is trusted, per decision record 0006. */
export const CONFIDENCE_FACTORS: Record<ConfidenceLabel, number> = {
  high: 1,
  medium: 0.75,
  low: 0.5,
  // Not enough evidence means no score at all, rather than a small one. A lot
  // we cannot value should not appear above one we can.
  insufficient: 0,
};

export type ScorableLot = {
  id: string;
  /** The rough target bid. Null where the lot could not be valued. */
  targetBid: number | null;
  confidence: ConfidenceLabel;
  /** Used only to break a tie. The soonest close needs attention first. */
  closesAt?: string | null;
};

export type ScoredLot = ScorableLot & {
  /** The target bid weighted by how much the evidence supports it. */
  weightedValue: number;
  /** 0 to 100, scaled against the best lot in this catalogue. */
  score: number;
};

/** What a lot is worth, discounted by how sure we are of it. */
export function weightedValueOf(lot: ScorableLot): number {
  if (lot.targetBid === null || !Number.isFinite(lot.targetBid)) return 0;
  return Math.max(0, lot.targetBid) * CONFIDENCE_FACTORS[lot.confidence];
}

/**
 * Scores and sorts a catalogue, best first.
 *
 * The score is relative to the catalogue it belongs to, so the best lot always
 * scores 100. It is not comparable across auctions, and the spec says so.
 *
 * Where two lots score the same, the one closing sooner comes first, because
 * that is the one that needs a decision now.
 */
export function scoreCatalogue(lots: ScorableLot[]): ScoredLot[] {
  const weighted = lots.map((lot) => ({ ...lot, weightedValue: weightedValueOf(lot) }));
  const best = weighted.reduce((most, lot) => Math.max(most, lot.weightedValue), 0);

  const scored = weighted.map((lot) => ({
    ...lot,
    // Every lot scores zero when nothing could be valued, rather than every
    // lot scoring 100, which dividing by zero would otherwise produce.
    score: best === 0 ? 0 : Math.floor((lot.weightedValue / best) * 100),
  }));

  return scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const closesA = a.closesAt ? new Date(a.closesAt).getTime() : Number.POSITIVE_INFINITY;
    const closesB = b.closesAt ? new Date(b.closesAt).getTime() : Number.POSITIVE_INFINITY;
    if (closesA !== closesB) return closesA - closesB;
    // A stable last resort, so the same catalogue always lists the same way.
    return a.id.localeCompare(b.id);
  });
}
