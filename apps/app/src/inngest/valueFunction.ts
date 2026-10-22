// S5 Triage value, as an Inngest function. F14, decision records 0018 to 0021
// and 0024.
//
// One step per lot, so a lot that cannot be valued takes only itself down. The
// spend ceiling is checked before each batch rather than after, the same way
// S4 does it, so it limits what is spent rather than reporting what was.
//
// Since decision record 0024 the first thing it does is read what we already
// hold. A resale value does not depend on who is buying, so a lot somebody
// else has already had valued needs no search, no model call and no page
// fetch: only the arithmetic that turns a range into this organisation's own
// maximum bid.

import { bandForScore, scoreCatalogue, type ScorableLot } from '@maxbid/calc';
import { createServiceSupabase } from '@maxbid/db/server';
import { SpendCeilingError } from '../ai/pricing';
import { inngest, valueRequested } from './client';
import { lotsWorthValuing } from './shortlist';
import { storedRangesFor, VALUATION_METHOD_VERSION, type SharedRange } from './sharedValuation';
import { assertBudgetLeft } from './triage';
import { applyRange, valueAndStore, type LotToValue, type ValuingContext } from './valueOneLot';

/** How many lots are valued at once. Each one searches and fetches pages. */
const AT_A_TIME = 3;

export type { LotToValue, ValuingContext };
export { kilometresOf, describeLot } from './valueOneLot';

/**
 * Scores the catalogue and stores the order. S6, decision record 0023.
 *
 * Runs once every lot has been valued, because the score is relative to the
 * best lot in the catalogue and there is no best until they are all done.
 *
 * The confidence that weights the score now comes from the stored valuation
 * rather than from a fixed guess. Until decision record 0024 there was
 * nowhere to keep it, so every valued lot counted as medium, which weighted
 * every lot identically and left the order decided by the bid figure alone.
 */
export async function scoreAndStore(analysisId: string) {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from('analysis_lots')
    .select('lot_id, triage_max_bid, lots(closes_at)')
    .eq('analysis_id', analysisId);
  if (error) throw new Error(`Could not read the analysis lots: ${error.message}`);

  const rows = data ?? [];
  const held = await storedRangesFor(rows.map((row) => row.lot_id));

  const lots: ScorableLot[] = rows.map((row) => {
    const targetBid = row.triage_max_bid === null ? null : Number(row.triage_max_bid);
    const confidence = held.get(row.lot_id)?.confidence;
    return {
      id: row.lot_id,
      targetBid: Number.isFinite(targetBid) ? targetBid : null,
      // A lot with no bid figure could not be valued, and the spec bands that
      // as insufficient so it cannot sit above a lot we can speak to.
      confidence:
        targetBid === null || confidence === undefined ? 'insufficient' : bandForScore(confidence),
      closesAt: (row.lots as { closes_at: string | null } | null)?.closes_at ?? null,
    };
  });

  const scored = scoreCatalogue(lots);
  for (const lot of scored) {
    const { error: failed } = await supabase
      .from('analysis_lots')
      .update({ opportunity_score: lot.score })
      .eq('analysis_id', analysisId)
      .eq('lot_id', lot.id);
    if (failed) throw new Error(`Could not store the score: ${failed.message}`);
  }
  return scored.length;
}

/**
 * What the organisation and the auction have told us, read once per run.
 *
 * Apart from the function so it stays inside the line limit, and so the shape
 * of what a valuation needs is visible in one place.
 */
export async function readContext(analysisId: string, orgId: string): Promise<ValuingContext> {
  const supabase = createServiceSupabase();
  const [analysis, profile] = await Promise.all([
    supabase
      .from('analyses')
      .select('auctions(premium_schedule, premium_gst), organisations(gst_registered)')
      .eq('id', analysisId)
      .single(),
    supabase
      .from('cost_profiles')
      .select(
        'profit_mode, target_profit_amount, target_return_pct, min_profit_amount, min_return_pct, completed_at',
      )
      .eq('org_id', orgId)
      .eq('is_default', true)
      .maybeSingle(),
  ]);

  return {
    gstRegistered: Boolean(analysis.data?.organisations?.gst_registered),
    profile: profile.data ?? null,
    premium: (analysis.data?.auctions?.premium_schedule ?? null) as ValuingContext['premium'],
    // Grays states GST is not added to the final bid price on these sales.
    gstOnHammer: false,
  };
}

/**
 * Every lot's identification, split by whether we already know its worth.
 *
 * The shortlist exists because valuing a lot costs a search, a model call and
 * up to four page fetches, and eight fetches a minute makes a 300 lot
 * catalogue six hours. A lot we already hold a range for costs none of that,
 * so it does not use up a shortlist place. That is the whole saving: a sale
 * read last night has every lot in held and nothing in chosen.
 */
export async function readLotsToValue(analysisId: string) {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from('lot_identifications')
    .select('lot_id, brand, model, year, specs, confidence, stage, lots(title, raw, current_bid)')
    .eq('analysis_id', analysisId)
    .eq('is_current', true);
  if (error) throw new Error(`Could not read the identifications: ${error.message}`);

  const all = (data ?? []) as unknown as (LotToValue & {
    lots: { title: string; raw: unknown; current_bid: number | string | null } | null;
  })[];

  const ranges = await storedRangesFor(all.map((lot) => lot.lot_id));
  const unknown = all.filter((lot) => !ranges.has(lot.lot_id));

  // A plain list, not the map. Every step result crosses a JSON boundary on
  // its way back from Inngest, and a Map does not survive that: it arrives as
  // an empty object, which would quietly look like nothing was held.
  const held = all
    .map((lot) => ({ lotId: lot.lot_id, range: ranges.get(lot.lot_id) }))
    .filter((entry): entry is { lotId: string; range: SharedRange } => entry.range !== undefined);

  const worth = new Set(
    lotsWorthValuing(
      unknown.map((lot) => ({
        lotId: lot.lot_id,
        currentBid:
          lot.lots?.current_bid === null || lot.lots?.current_bid === undefined
            ? null
            : Number(lot.lots.current_bid),
        unidentified: !lot.brand && !lot.model,
      })),
    ).map((lot) => lot.lotId),
  );

  return {
    chosen: unknown.filter((lot) => worth.has(lot.lot_id)),
    held,
    considered: all.length,
  };
}

export const valueLots = inngest.createFunction(
  {
    id: 'triage-value',
    name: 'S5 Triage value',
    triggers: [{ event: valueRequested }],
    concurrency: { key: 'event.data.analysisId', limit: 1 },
    retries: 2,
    onFailure: async ({ event, step }) => {
      const analysisId = event.data.event.data.analysisId;
      await step.run('mark-failed', async () => {
        const supabase = createServiceSupabase();
        await supabase.from('analyses').update({ status: 'failed' }).eq('id', analysisId);
      });
    },
  },
  async ({ event, step }) => {
    const { analysisId, orgId } = event.data;

    const lots = await step.run('read-identifications', async () => readLotsToValue(analysisId));
    const context = await step.run('read-context', async () => readContext(analysisId, orgId));

    // Everything we already hold, before anything is spent. Arithmetic only,
    // so those rows fill in at once rather than over forty minutes.
    const reused = await step.run('apply-stored-ranges', async () => {
      for (const entry of lots.held) {
        await applyRange(entry.lotId, entry.range, { analysisId }, context);
      }
      return lots.held.length;
    });

    const chosen = lots.chosen;
    let valued = 0;
    let withoutEvidence = 0;
    let stoppedForSpend = false;

    for (let start = 0; start < chosen.length; start += AT_A_TIME) {
      if (stoppedForSpend) break;

      const roomLeft = await step.run(`budget-${start}`, async () => {
        try {
          await assertBudgetLeft(analysisId);
          return { ok: true as const };
        } catch (cause) {
          if (cause instanceof SpendCeilingError) return { ok: false as const };
          throw cause;
        }
      });
      if (!roomLeft.ok) {
        stoppedForSpend = true;
        break;
      }

      const results = await Promise.all(
        chosen.slice(start, start + AT_A_TIME).map((lot) =>
          step
            .run(`value-${lot.lot_id}`, async () => ({
              valued: (await valueAndStore(lot, { orgId, analysisId }, context)) !== null,
            }))
            .catch(() => ({ valued: false })),
        ),
      );

      for (const result of results) {
        if (result.valued) valued += 1;
        else withoutEvidence += 1;
      }
    }

    // S6. Scored after every lot, because the score is relative to the best
    // lot in the catalogue and there is no best until they are all done.
    await step.run('score-catalogue', async () => scoreAndStore(analysisId));

    await step.run('mark-valued', async () => {
      const supabase = createServiceSupabase();
      const { error } = await supabase
        .from('analyses')
        .update({
          status: stoppedForSpend ? 'failed' : 'triaged',
          progress_pct: stoppedForSpend ? 50 : 60,
        })
        .eq('id', analysisId);
      if (error) throw new Error(`Could not update the analysis: ${error.message}`);
    });

    return {
      analysisId,
      considered: lots.considered,
      valued,
      reused,
      withoutEvidence,
      stoppedForSpend,
      methodVersion: VALUATION_METHOD_VERSION,
    };
  },
);
