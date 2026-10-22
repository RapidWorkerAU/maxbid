// Reading and writing the shared resale range. Decision record 0024.
//
// A resale value does not depend on who is buying, so it is worked out once
// and read by everybody. This is the part of S5 that decides whether any work
// needs doing at all.
//
// When a stored range may be reused is decision A of 22 October 2026: while
// the method that produced it is the method we still run, whatever its age.
// Two things can make a stored range wrong, the market moving or our method
// changing, and only the second one is something we can detect. Resale values
// on vehicles and machinery move over quarters, and the error we measured on
// the real Grays sale was poor comparables rather than old ones, so an age
// limit would spend the crawler's budget on a problem we have not seen.

import { confidenceFor, type Valuation } from '@maxbid/calc';
import { createServiceSupabase } from '@maxbid/db/server';

/**
 * Which version of the valuation method is running.
 *
 * **Bump this whenever the method changes what the answer would be**: the
 * weights in decision record 0020, the minimum evidence rule, the asking
 * discount, or how comparables are gathered and graded. A stored range is
 * only reused while this matches, so forgetting to bump it is how a stale
 * figure survives a fix.
 */
export const VALUATION_METHOD_VERSION = 'triage-valuation-1';

/** A resale range we already hold, or have just worked out. */
export type SharedRange = {
  conservative: number;
  expected: number;
  optimistic: number;
  /** 0 to 100, from packages/calc. Decides where the lot ranks. */
  confidence: number;
  comparableCount: number;
  combinedWeight: number;
};

/** Postgres numerics arrive as strings. A range needs numbers. */
function asNumber(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * The range we already hold for these lots, keyed by lot.
 *
 * Reads the whole shortlist in one query rather than one per lot, because the
 * point of holding them is that reading is cheap.
 *
 * A row made by an older method is not returned, so the lot is valued again
 * and the new range supersedes it.
 */
export async function storedRangesFor(lotIds: string[]): Promise<Map<string, SharedRange>> {
  const held = new Map<string, SharedRange>();
  if (lotIds.length === 0) return held;

  const { data, error } = await createServiceSupabase()
    .from('triage_valuations')
    .select(
      'lot_id, conservative, expected, optimistic, confidence, comparable_count, combined_weight',
    )
    .in('lot_id', lotIds)
    .eq('method_version', VALUATION_METHOD_VERSION)
    .eq('is_current', true);
  if (error) throw new Error(`Could not read the stored ranges: ${error.message}`);

  for (const row of data ?? []) {
    const conservative = asNumber(row.conservative);
    const expected = asNumber(row.expected);
    const optimistic = asNumber(row.optimistic);
    // All three or none. Half a range is not a range, and the column is not
    // nullable, so a missing one means something we do not understand rather
    // than a lot we know less about.
    if (conservative === null || expected === null || optimistic === null) continue;

    held.set(row.lot_id, {
      conservative,
      expected,
      optimistic,
      confidence: asNumber(row.confidence) ?? 0,
      comparableCount: row.comparable_count,
      combinedWeight: asNumber(row.combined_weight) ?? 0,
    });
  }
  return held;
}

/**
 * Turns a fresh valuation into a range worth storing, or null.
 *
 * Null where the evidence threshold was not met. F26 says a lot we cannot
 * value shows no bid figure, so there must be no range to store by accident.
 * Pure, so the rule is testable without a database.
 */
export function rangeFrom(
  valuation: Valuation | null,
  identification: { confidence: number | null; confirmed: boolean },
): SharedRange | null {
  const scenarios = valuation?.scenarios;
  if (!valuation || scenarios?.conservative == null || scenarios.expected == null) return null;
  if (scenarios.optimistic == null) return null;

  return {
    conservative: scenarios.conservative,
    expected: scenarios.expected,
    optimistic: scenarios.optimistic,
    confidence: confidenceFor({
      valuation,
      identificationConfidence: identification.confidence ?? 0,
      identificationConfirmed: identification.confirmed,
    }).score,
    comparableCount: valuation.counted.length,
    combinedWeight: valuation.combinedWeight,
  };
}

/**
 * Stores a range for everybody, superseding the one it replaces.
 *
 * The earlier row steps down before the new one arrives, because only one may
 * be current per lot and the unique index makes that a rule rather than a
 * convention. The superseded rows are kept, so a figure shown last week can
 * still be explained.
 */
export async function storeRange(lotId: string, range: SharedRange) {
  const supabase = createServiceSupabase();

  await supabase
    .from('triage_valuations')
    .update({ is_current: false })
    .eq('lot_id', lotId)
    .eq('is_current', true);

  const { error } = await supabase.from('triage_valuations').insert({
    lot_id: lotId,
    conservative: range.conservative,
    expected: range.expected,
    optimistic: range.optimistic,
    confidence: range.confidence,
    comparable_count: range.comparableCount,
    combined_weight: range.combinedWeight,
    method_version: VALUATION_METHOD_VERSION,
  });
  if (error) throw new Error(`Could not store the range: ${error.message}`);
}
