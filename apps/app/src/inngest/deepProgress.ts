// Saying where a deep run has got to. SC04.
//
// A run that takes minutes and says nothing is a run the reader cannot tell
// from one that failed. The sentence after pressing the button said work had
// started and then never changed, which is the same as saying nothing.
//
// So the run records where it is as it goes, lot by lot, and the screen reads
// it. Both statuses already exist: analyses.status has deep_running and
// analysis_lots.status has deep_running and valued, from the first migration.
// Nothing here is new state, it is state nothing was writing.

import { createServiceSupabase } from '@maxbid/db/server';

/** What a lot is doing, as analysis_lots records it. */
export type LotProgress = 'shortlisted' | 'deep_running' | 'valued' | 'failed';

/** Marks the analysis as running a deep pass, or finished with one. */
export async function markAnalysis(analysisId: string, status: 'deep_running' | 'triaged') {
  const { error } = await createServiceSupabase()
    .from('analyses')
    .update({ status })
    .eq('id', analysisId);
  if (error) throw new Error(`Could not mark the analysis: ${error.message}`);
}

/**
 * Marks what one lot is doing.
 *
 * Failures do not throw. A lot whose progress we could not record is still a
 * lot we read, and losing the reading because the bookkeeping failed would be
 * the wrong way round.
 */
export async function markLot(analysisId: string, lotId: string, status: LotProgress) {
  const { error } = await createServiceSupabase()
    .from('analysis_lots')
    .update({ status })
    .eq('analysis_id', analysisId)
    .eq('lot_id', lotId);
  if (error) console.error(`Could not mark lot ${lotId} as ${status}: ${error.message}`);
}

/** Marks several lots at once, for the start and the end of a run. */
export async function markLots(analysisId: string, lotIds: string[], status: LotProgress) {
  if (lotIds.length === 0) return;
  const { error } = await createServiceSupabase()
    .from('analysis_lots')
    .update({ status })
    .eq('analysis_id', analysisId)
    .in('lot_id', lotIds);
  if (error) console.error(`Could not mark ${lotIds.length} lots as ${status}: ${error.message}`);
}
