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

/**
 * How long before a lot we could not value is tried again. O19.
 *
 * Seven days, because a lot fails for want of comparables and comparables
 * arrive when the archive grows. Decision record 0021 makes accuracy a
 * function of how many sales we have harvested, and that grows over weeks
 * rather than hours, so trying again tonight would spend the same fetches on
 * the same answer.
 *
 * A changed method version overrides this and tries again at once, which is
 * the same rule decision record 0025 uses for reusing a range: when we improve
 * the method, every lot it failed on is worth another look.
 */
export const RETRY_A_FAILED_VALUATION_AFTER_DAYS = 7;

/** Pure, so the cooling off rule is testable without a database. */
export function tooSoonToTryAgain(attemptedAt: string | null, now: Date = new Date()): boolean {
  if (!attemptedAt) return false;
  const attempted = new Date(attemptedAt).getTime();
  if (!Number.isFinite(attempted)) return false;

  const days = (now.getTime() - attempted) / 86_400_000;
  return days < RETRY_A_FAILED_VALUATION_AFTER_DAYS;
}

/**
 * The lots we tried to value recently with this method and could not.
 *
 * Only this method's attempts are read, so improving the method makes every
 * lot it failed on eligible again without anything having to clear the table.
 */
export async function recentlyFailedFor(
  lotIds: string[],
  now: Date = new Date(),
): Promise<Set<string>> {
  if (lotIds.length === 0) return new Set();

  const { data, error } = await createServiceSupabase()
    .from('valuation_attempts')
    .select('lot_id, attempted_at')
    .in('lot_id', lotIds)
    .eq('method_version', VALUATION_METHOD_VERSION);
  if (error) throw new Error(`Could not read the valuation attempts: ${error.message}`);

  return new Set(
    (data ?? []).filter((row) => tooSoonToTryAgain(row.attempted_at, now)).map((row) => row.lot_id),
  );
}

/**
 * Records that we tried to value a lot and found too little evidence.
 *
 * Replaces this method's earlier attempt rather than adding to it, because
 * the only question asked of the table is when we last tried.
 *
 * What it found is kept so a lot that was close can be told from one that
 * found nothing, which is what says whether the archive growing will help.
 */
export async function recordFailedAttempt(lotId: string, found: Valuation | null) {
  const { error } = await createServiceSupabase()
    .from('valuation_attempts')
    .upsert(
      {
        lot_id: lotId,
        method_version: VALUATION_METHOD_VERSION,
        attempted_at: new Date().toISOString(),
        comparable_count: found?.counted.length ?? 0,
        combined_weight: found?.combinedWeight ?? 0,
      },
      { onConflict: 'lot_id,method_version' },
    );
  if (error) throw new Error(`Could not record the attempt: ${error.message}`);
}
