'use server';

// Setting a comparable aside, and saying what that did to the figures. F62.
//
// The evidence panel exists so a reader can judge what a range was built
// from. This is what lets them act on that judgement: a comparable that is
// plainly not the same thing drags a range with it, and until now they could
// see that and do nothing.
//
// A reason is required, by the table and by F62. An exclusion with no reason
// is just a missing number, and nobody looking at the figures in a month
// could tell why they moved.
//
// The exclusion belongs to the analysis. The comparable itself stays a shared
// fact, because one organisation deciding a listing is not the same thing
// does not make it so for everybody. Decision record 0024.

import { recomputeRequested, inngest } from '../inngest/client';
import { supabaseServer } from './supabase';

export type ExclusionResult = { error: string } | { excluded: boolean };

export async function excludeComparable(
  analysisId: string,
  lotId: string,
  lotComparableId: string,
  reason: string,
): Promise<ExclusionResult> {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: 'Your session has expired. Please sign in again.' };

  const said = reason.trim();
  if (said === '') {
    return { error: 'Say why this one does not belong, so the figures can be explained later.' };
  }

  // Written through the user's own client, so row level security answers
  // whether the analysis is theirs. This is the one judgement in the evidence
  // trail that belongs to the user rather than to the pipeline, and it is the
  // one place they are allowed to write.
  const { error } = await supabase.from('comparable_exclusions').insert({
    analysis_id: analysisId,
    lot_comparable_id: lotComparableId,
    reason: said,
    excluded_by: auth.user.id,
  });
  if (error) {
    return { error: 'We could not set that comparable aside. Please try again.' };
  }

  await startRevaluation(analysisId, lotId);
  return { excluded: true };
}

/** Putting one back. Changing their mind is a delete, so the reason is gone with it. */
export async function includeComparable(
  analysisId: string,
  lotId: string,
  lotComparableId: string,
): Promise<ExclusionResult> {
  const supabase = await supabaseServer();

  const { error } = await supabase
    .from('comparable_exclusions')
    .delete()
    .eq('analysis_id', analysisId)
    .eq('lot_comparable_id', lotComparableId);
  if (error) return { error: 'We could not put that comparable back. Please try again.' };

  await startRevaluation(analysisId, lotId);
  return { excluded: false };
}

/**
 * Works the figures out again, because they are now built on different
 * evidence.
 *
 * Failing to start it does not fail the exclusion. The judgement is recorded
 * either way, and leaving figures on screen that we know are stale is the
 * thing to avoid, not the thing to fail over.
 */
async function startRevaluation(analysisId: string, lotId: string) {
  try {
    await inngest.send({ name: recomputeRequested.name, data: { analysisId, lotId } });
  } catch (cause) {
    console.error('Recorded the exclusion but could not revalue', cause);
  }
}

/** Which comparables this analysis has set aside, so the panel can say so. */
export async function exclusionsFor(analysisId: string): Promise<Map<string, string>> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from('comparable_exclusions')
    .select('lot_comparable_id, reason')
    .eq('analysis_id', analysisId);

  return new Map((data ?? []).map((row) => [row.lot_comparable_id, row.reason]));
}
