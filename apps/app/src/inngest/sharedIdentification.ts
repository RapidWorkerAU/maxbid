// Reading and writing what a lot is, shared across organisations.
// Decision record 0024.
//
// A 2015 Mitsubishi Outlander is a 2015 Mitsubishi Outlander whoever bought
// it, so it is worked out once and read by everybody. An organisation may
// still correct it, and their correction belongs to them.
//
// An identification has two kinds, which is what the nullable analysis_id on
// lot_identifications means:
//
//   analysis_id is null  the baseline every organisation reads
//   analysis_id is set   one organisation's own correction
//
// Each kind has its own uniqueness rule, so a baseline and a correction can
// both be current without clashing. They answer different questions.

import { createServiceSupabase } from '@maxbid/db/server';
import type { Json } from '@maxbid/db';
import { namesSomething, preferCorrection } from '../lib/identifications';
import type { IdentifiedLot } from './triage';

/** What a lot is, as the valuation stage needs to read it. */
export type LotIdentification = {
  /** The row's own id. The evidence for a lot hangs off it. F59. */
  id: string;
  lot_id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  specs: unknown;
  confidence: number | string | null;
  stage: string | null;
  condition_notes: string | null;
  /** Null for the shared baseline, set for this organisation's correction. */
  analysis_id: string | null;
};

const COLUMNS =
  'id, lot_id, brand, model, year, specs, confidence, stage, condition_notes, analysis_id';

/**
 * Which of these lots we already know the identity of.
 *
 * A baseline, not a correction: a correction answers what one organisation
 * says a lot is, which is no reason to skip working out what it actually is.
 *
 * There is no version column on an identification, so a baseline is reused
 * however old it is. That is the right default because what a lot physically
 * is does not change, unlike its resale value. Improving the prompt therefore
 * means clearing the baselines deliberately rather than waiting for them to
 * expire.
 */
export async function alreadyIdentified(lotIds: string[]): Promise<Set<string>> {
  if (lotIds.length === 0) return new Set();

  const { data, error } = await createServiceSupabase()
    .from('lot_identifications')
    .select('lot_id, brand, model')
    .in('lot_id', lotIds)
    .is('analysis_id', null)
    .eq('is_current', true);
  if (error) throw new Error(`Could not read the identifications: ${error.message}`);

  // A row that named neither a brand nor a model is not an identification. It
  // is a record that we tried, and skipping on it would carry one bad reading
  // forward to every organisation that ever looks at the lot.
  return new Set((data ?? []).filter(namesSomething).map((row) => row.lot_id));
}

/**
 * What every lot in an auction is, as this analysis should read it.
 *
 * Both kinds come back in one query. Reading them separately would mean two
 * round trips to answer one question.
 */
export async function identificationsFor(
  auctionId: string,
  analysisId: string,
): Promise<LotIdentification[]> {
  const { data, error } = await createServiceSupabase()
    .from('lot_identifications')
    .select(`${COLUMNS}, lots!inner(auction_id)`)
    .eq('lots.auction_id', auctionId)
    .eq('is_current', true)
    .or(`analysis_id.is.null,analysis_id.eq.${analysisId}`);
  if (error) throw new Error(`Could not read the identifications: ${error.message}`);

  return preferCorrection((data ?? []) as unknown as LotIdentification[]);
}

/**
 * Stores what a lot is for everybody, superseding the baseline before it.
 *
 * The earlier row steps down first, because only one baseline may be current
 * per lot and the unique index makes that a rule rather than a convention.
 * The superseded rows are kept, so a figure shown last week can still be
 * explained.
 *
 * Nothing here takes an analysis. An identification made by the pipeline is
 * the baseline, and tying it to whichever organisation happened to ask first
 * is what decision record 0024 removed.
 */
export async function storeBaseline(result: IdentifiedLot) {
  const supabase = createServiceSupabase();

  await supabase
    .from('lot_identifications')
    .update({ is_current: false })
    .eq('lot_id', result.lotId)
    .is('analysis_id', null)
    .eq('is_current', true);

  const { error } = await supabase.from('lot_identifications').insert({
    analysis_id: null,
    lot_id: result.lotId,
    stage: 'triage',
    brand: result.identification.brand,
    model: result.identification.model,
    year: result.identification.year,
    specs: result.identification.specs as Json,
    condition_notes: result.identification.conditionNotes,
    confidence: result.identification.confidence,
    ai_run_id: result.aiRunId,
  });
  if (error) throw new Error(`Could not store the identification: ${error.message}`);
}
