// How close an estimate turned out to be.
//
// Every lot of a closed catalogue has both a figure MaxBid produced and a
// price it actually fetched, so the estimates can be checked rather than
// trusted. F94 publishes accuracy by category once there is enough of it, and
// this is the maths underneath.
//
// Nothing here judges. It reports what was estimated, what happened, and the
// distance between them.

/** One lot that has both an estimate and a result. */
export type EstimateAndOutcome = {
  id: string;
  /** The conservative end of the resale range. */
  low: number;
  /** The optimistic end. */
  high: number;
  /** What the lot actually fetched under the hammer. */
  soldFor: number;
};

export type LotAccuracy = EstimateAndOutcome & {
  /** True when the hammer price landed inside the range we gave. */
  insideTheRange: boolean;
  /**
   * The conservative estimate divided by what it fetched.
   *
   * Above 1 means we said it was worth more than the auction paid, which is
   * the ordinary case: a retail resale is worth more than an auction price,
   * and that gap is the margin. Far above 1 means the estimate was high.
   */
  ratio: number;
};

export type AccuracySummary = {
  lots: LotAccuracy[];
  /** How many hammer prices landed inside the range. */
  insideTheRange: number;
  /** The middle ratio, which says more than an average on a small sample. */
  medianRatio: number | null;
  /** The furthest the conservative estimate was above a hammer price. */
  highestRatio: number | null;
  /** And the furthest below. */
  lowestRatio: number | null;
};

/** Where one estimate landed against what happened. */
export function accuracyOf(lot: EstimateAndOutcome): LotAccuracy {
  return {
    ...lot,
    insideTheRange: lot.soldFor >= lot.low && lot.soldFor <= lot.high,
    ratio: lot.soldFor === 0 ? 0 : lot.low / lot.soldFor,
  };
}

/** The middle value, which a handful of lots describes better than a mean. */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
}

/**
 * How a set of estimates turned out.
 *
 * A lot that did not sell, or that we never valued, is not in here at all.
 * Counting it would make the figures look better or worse than they are
 * depending on which way it was left out.
 */
export function summariseAccuracy(lots: EstimateAndOutcome[]): AccuracySummary {
  const measured = lots.filter((lot) => lot.soldFor > 0).map(accuracyOf);
  const ratios = measured.map((lot) => lot.ratio);

  return {
    lots: measured,
    insideTheRange: measured.filter((lot) => lot.insideTheRange).length,
    medianRatio: median(ratios),
    highestRatio: ratios.length > 0 ? Math.max(...ratios) : null,
    lowestRatio: ratios.length > 0 ? Math.min(...ratios) : null,
  };
}
