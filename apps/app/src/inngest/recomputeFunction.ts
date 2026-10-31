// Working one lot's figures out again after an exclusion. F62.
//
// No network and no cost. The comparables are the ones we already found, and
// the only thing that changed is which of them this organisation counts. So
// this reads the evidence back, weighs it twice, stores what the exclusions
// did and leaves the organisation's own figures behind.

import { createServiceSupabase } from '@maxbid/db/server';
import { inngest, recomputeRequested } from './client';
import { comparablesFor, rangeBeforeAndAfter } from './recompute';
import { identificationsFor } from './sharedIdentification';
import { rangeFrom } from './sharedValuation';
import { readContext } from './valueFunction';
import { applyRange, storeOverride } from './valueOneLot';

/**
 * What the exclusions did, written where the lot screen can read it. DS17.
 *
 * The expected resale rather than the cautious one, because that is the
 * figure DS17 names. Null the whole way through once nothing is set aside,
 * so putting the last one back leaves no trace of a change that is no longer
 * true.
 */
export async function storeEffect(
  where: { analysisId: string; lotId: string },
  effect: { excluded: number; before: number | null; after: number | null } | null,
) {
  const { error } = await createServiceSupabase()
    .from('analysis_lots')
    .update({ exclusion_effect: effect })
    .eq('analysis_id', where.analysisId)
    .eq('lot_id', where.lotId);
  if (error) throw new Error(`Could not store what the exclusions did: ${error.message}`);
}

/** The expected resale as a whole number, or null where we cannot say. */
function expectedIn(valuation: ReturnType<typeof rangeBeforeAndAfter>['before']): number | null {
  const expected = valuation.scenarios.expected;
  return valuation.hasEnoughEvidence && expected !== null ? Math.round(expected) : null;
}

/** Everything this stage needs, read in one go. */
async function readEvidence(analysisId: string, lotId: string) {
  const supabase = createServiceSupabase();
  const { data: analysis, error } = await supabase
    .from('analyses')
    .select('auction_id, org_id')
    .eq('id', analysisId)
    .single();
  if (error) throw new Error(`Could not read the analysis: ${error.message}`);

  const identification = (await identificationsFor(analysis.auction_id, analysisId)).find(
    (row) => row.lot_id === lotId,
  );
  if (!identification) return null;

  const { data: excluded } = await supabase
    .from('comparable_exclusions')
    .select('lot_comparable_id')
    .eq('analysis_id', analysisId);

  return {
    orgId: analysis.org_id,
    identification,
    comparables: await comparablesFor(identification.id),
    // A list rather than a Set, because a step result crosses a JSON
    // boundary and a Set arrives as an empty object.
    excluded: (excluded ?? []).map((row) => row.lot_comparable_id),
  };
}

export const recompute = inngest.createFunction(
  {
    id: 'recompute-lot',
    name: 'Work one lot out again from the evidence we hold',
    triggers: [{ event: recomputeRequested }],
    concurrency: { key: 'event.data.lotId', limit: 1 },
    retries: 1,
  },
  async ({ event, step }) => {
    const { analysisId, lotId } = event.data;

    const found = await step.run('read-the-evidence', () => readEvidence(analysisId, lotId));

    if (!found || found.comparables.length === 0) {
      return { analysisId, lotId, recomputed: false, why: 'no evidence held' };
    }

    const context = await step.run('read-context', () => readContext(analysisId, found.orgId));

    return await step.run('work-it-out-again', async () => {
      const { before, after } = rangeBeforeAndAfter(found.comparables, new Set(found.excluded));

      const certainty = {
        confidence:
          found.identification.confidence === null ? null : Number(found.identification.confidence),
        confirmed: found.identification.stage === 'user',
      };
      const range = rangeFrom(after, certainty);

      await storeEffect(
        { analysisId, lotId },
        found.excluded.length === 0
          ? null
          : {
              excluded: found.excluded.length,
              before: expectedIn(before),
              after: expectedIn(after),
            },
      );

      // Below the evidence rule once the excluded ones are set aside. The
      // figures go rather than staying at a number we would no longer stand
      // behind, and the screen says there is not enough evidence, which is
      // true and is what their own exclusion made true.
      if (!range) {
        const { error } = await createServiceSupabase()
          .from('analysis_lots')
          .update({ triage_low: null, triage_high: null, triage_max_bid: null })
          .eq('analysis_id', analysisId)
          .eq('lot_id', lotId);
        if (error) throw new Error(`Could not clear the figures: ${error.message}`);
        return { analysisId, lotId, recomputed: true, enoughEvidence: false };
      }

      // Theirs, because it is a consequence of their judgement about the
      // evidence rather than a fact about the lot. Decision record 0024.
      await storeOverride(lotId, range, { analysisId });
      await applyRange(lotId, range, { analysisId }, context);

      return { analysisId, lotId, recomputed: true, enoughEvidence: true };
    });
  },
);
