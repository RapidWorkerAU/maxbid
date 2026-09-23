// Weighted percentiles, used for the three resale scenarios.
//
// A judgment call, flagged because the specification does not make it.
// matching-and-valuation.md says "weighted 25th percentile" without saying
// which definition, and the definitions disagree most on small samples, which
// is exactly our case: the minimum evidence rule allows a scenario on three
// comparables.
//
// This uses the lower weighted percentile: walk the values in order,
// accumulating weight, and take the first value whose running total reaches
// the target share of the total weight.
//
// Why this one:
//
// 1. It always returns a price that a real comparable actually carried. An
//    interpolating definition can return a number no listing ever showed,
//    which is hard to defend to a user reading the evidence panel, and CP07
//    says every figure declares its source.
// 2. It is conservative at the 25th percentile, which is the figure the
//    default bid is built on. D20 makes conservative the default precisely to
//    protect the user from bidding on optimism.
// 3. It behaves predictably on three points, where interpolation across
//    uneven weights starts producing surprising results.

export type WeightedValue = {
  value: number;
  weight: number;
};

/**
 * The weighted percentile of a set of values.
 *
 * @param share 0 to 1. Use 0.25, 0.5 and 0.75 for the three scenarios.
 * @returns null when there is nothing to measure.
 */
export function weightedPercentile(values: WeightedValue[], share: number): number | null {
  const usable = values.filter((v) => v.weight > 0 && Number.isFinite(v.value));
  if (usable.length === 0) return null;

  const sorted = [...usable].sort((a, b) => a.value - b.value);
  const totalWeight = sorted.reduce((sum, v) => sum + v.weight, 0);
  if (totalWeight <= 0) return null;

  const target = totalWeight * share;
  let running = 0;
  for (const entry of sorted) {
    running += entry.weight;
    // A small tolerance, so floating point noise cannot skip a value whose
    // running total lands exactly on the target.
    if (running >= target - 1e-9) return entry.value;
  }
  return sorted[sorted.length - 1]?.value ?? null;
}

/** The weighted mean, used by the price agreement part of the confidence score. */
export function weightedMean(values: WeightedValue[]): number | null {
  const usable = values.filter((v) => v.weight > 0 && Number.isFinite(v.value));
  if (usable.length === 0) return null;
  const totalWeight = usable.reduce((sum, v) => sum + v.weight, 0);
  if (totalWeight <= 0) return null;
  return usable.reduce((sum, v) => sum + v.value * v.weight, 0) / totalWeight;
}

/**
 * The weighted coefficient of variation: the standard deviation over the mean.
 *
 * The second judgment call. The specification says "coefficient of variation
 * of adjusted prices" without saying whether it is weighted. It is weighted
 * here, so that a strong comparable and a weak one do not sway the spread
 * equally, which is the whole point of weighting them in the first place.
 */
export function weightedCoefficientOfVariation(values: WeightedValue[]): number | null {
  const mean = weightedMean(values);
  if (mean === null || mean === 0) return null;

  const usable = values.filter((v) => v.weight > 0 && Number.isFinite(v.value));
  const totalWeight = usable.reduce((sum, v) => sum + v.weight, 0);
  const variance =
    usable.reduce((sum, v) => sum + v.weight * (v.value - mean) ** 2, 0) / totalWeight;
  return Math.sqrt(variance) / mean;
}
