// Reading how far a comparable has been driven, off its own listing page.
//
// Decision record 0019 caps a match at similarAlternative when nobody stated
// the comparable's usage, because on a used vehicle usage is the difference
// that decides the price. Measured across six real lots, not one search
// snippet stated a kilometre reading, so every comparable capped and not one
// lot produced a range.
//
// The snippet is not the listing. The listing states it. So where a snippet is
// silent, the page behind it is fetched and read.
//
// That costs a page fetch, so only the comparables that might change the
// answer are fetched: the ones that matched well enough to count, and only
// where the snippet did not already say.

/**
 * An odometer reading on an Australian listing page.
 *
 * Written a dozen ways: "145,200 km", "145200km", "Odometer 145,200",
 * "145,200 kms". The unit has to be there. A bare number on a listing page is
 * as likely to be a price, a postcode or a stock number.
 */
const READINGS = [
  /odometer\D{0,12}?([\d][\d,\s]{2,9}\d)\s*(?:km|kms|kilometres)?/gi,
  /([\d][\d,\s]{2,9}\d)\s*(?:km|kms|kilometres)\b/gi,
];

/** Below this a figure is more likely a price or a typo than a reading. */
const LEAST_PLAUSIBLE = 100;
/** Above this it is not a reading anyone would believe. */
const MOST_PLAUSIBLE = 1_500_000;

export type UsageReading = {
  /** Kilometres, as a number. */
  kilometres: number;
  /** The text it was read from, so a person can check it. */
  source: string;
};

/**
 * Finds the odometer reading on a listing page.
 *
 * Takes the reading that appears most often, because a listing page repeats
 * the real figure in its summary, its specification table and often its
 * description, while a stray number appears once. Returns null rather than
 * guessing when nothing plausible is there.
 */
export function readUsage(markdown: string): UsageReading | null {
  const counts = new Map<number, { count: number; source: string }>();

  for (const pattern of READINGS) {
    for (const match of markdown.matchAll(pattern)) {
      const digits = (match[1] ?? '').replace(/[,\s]/g, '');
      const value = Number(digits);
      if (!Number.isFinite(value)) continue;
      if (value < LEAST_PLAUSIBLE || value > MOST_PLAUSIBLE) continue;

      const seen = counts.get(value);
      if (seen) seen.count += 1;
      else counts.set(value, { count: 1, source: match[0].trim() });
    }
  }

  if (counts.size === 0) return null;

  // Most repeated wins. Where two tie, the larger reading is the safer one to
  // believe, because understating usage overstates what a lot is worth.
  const best = [...counts.entries()].sort(
    (a, b) => b[1].count - a[1].count || b[0] - a[0],
  )[0]!;

  return { kilometres: best[0], source: best[1].source };
}

/** How many kilometres apart two readings are, as a fraction of the larger. */
export function usageGap(lot: number, comparable: number): number {
  const larger = Math.max(lot, comparable);
  if (larger === 0) return 0;
  return Math.abs(lot - comparable) / larger;
}

/**
 * How far apart two readings have to be before they are different items.
 *
 * A setting rather than a constant, per decision record 0019, because the
 * right value is not knowable in advance and differs by category. Thirty per
 * cent is a starting point: 150,000 against 200,000 is the same sort of car,
 * and 150,000 against 550,000 is not.
 */
export const MATERIAL_USAGE_GAP = 0.3;
