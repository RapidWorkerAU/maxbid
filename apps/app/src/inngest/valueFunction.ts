// S5 Triage value, as an Inngest function. F14, decision records 0018 to 0021.
//
// One step per lot, so a lot that cannot be valued takes only itself down. The
// spend ceiling is checked before each batch rather than after, the same way
// S4 does it, so it limits what is spent rather than reporting what was.

import { bandForScore, scoreCatalogue, type ScorableLot } from '@maxbid/calc';
import { createServiceSupabase } from '@maxbid/db/server';
import { SpendCeilingError } from '../ai/pricing';
import { inngest, valueRequested } from './client';
import { assertBudgetLeft } from './triage';
import { targetBidFor } from './targetBid';
import { valueLot } from './valueLot';

/** How many lots are valued at once. Each one searches and fetches pages. */
const AT_A_TIME = 3;

/** What we know about a lot before valuing it. */
type LotToValue = {
  lot_id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  specs: unknown;
  lots: { title: string; raw: unknown } | null;
};

/** The odometer the catalogue stated, which decides the usage grading. */
export function kilometresOf(raw: unknown): number | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const attributes = (raw as Record<string, unknown>).attributes;
  if (typeof attributes !== 'object' || attributes === null) return null;
  const reading = (attributes as Record<string, unknown>).odometer;
  if (typeof reading !== 'string') return null;
  const value = Number(reading.replace(/[^\d]/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** The lot in words, for the model to compare listings against. */
export function describeLot(lot: LotToValue, kilometres: number | null): string {
  const specs = (lot.specs ?? {}) as Record<string, unknown>;
  return [
    lot.year,
    lot.brand,
    lot.model,
    typeof specs.fuel === 'string' ? specs.fuel : null,
    kilometres ? `odometer ${kilometres.toLocaleString()} km` : null,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Values one lot and stores its range, returning whether it got one.
 *
 * Only a range that met the evidence threshold is stored. A lot without one
 * keeps null, which the screen reads as not enough evidence rather than as a
 * value of nothing.
 */
/** What the organisation and the auction have told us, read once per run. */
export type ValuingContext = {
  gstRegistered: boolean;
  profile: Parameters<typeof targetBidFor>[1]['profile'];
  premium: Parameters<typeof targetBidFor>[2]['premium'];
  gstOnHammer: boolean;
};

async function valueAndStore(
  lot: LotToValue,
  where: { orgId: string; analysisId: string },
  context: ValuingContext,
): Promise<boolean> {
  const kilometres = kilometresOf(lot.lots?.raw);
  const result = await valueLot({
    subject: {
      brand: lot.brand,
      model: lot.model,
      year: lot.year,
      specs: (lot.specs ?? {}) as Record<string, unknown>,
    },
    lotKilometres: kilometres,
    describedAs: describeLot(lot, kilometres),
    where: { ...where, lotId: lot.lot_id },
  });

  const scenarios = result.valuation?.scenarios;
  if (scenarios?.expected == null) return false;

  // The conservative resale, not the expected one, because a bid figure is
  // advice and the cautious end of a range is the honest one to advise from.
  const limits = targetBidFor(
    scenarios.conservative!,
    { gstRegistered: context.gstRegistered, profile: context.profile },
    { premium: context.premium, gstOnHammer: context.gstOnHammer },
  );

  const { error } = await createServiceSupabase()
    .from('analysis_lots')
    .update({
      triage_low: scenarios.conservative,
      triage_high: scenarios.optimistic,
      triage_max_bid: limits?.targetBid ?? null,
    })
    .eq('analysis_id', where.analysisId)
    .eq('lot_id', lot.lot_id);
  if (error) throw new Error(`Could not store the range: ${error.message}`);
  return true;
}

/**
 * Scores the catalogue and stores the order. S6, decision record 0023.
 *
 * Runs once every lot has been valued, because the score is relative to the
 * best lot in the catalogue and there is no best until they are all done.
 */
export async function scoreAndStore(analysisId: string) {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from('analysis_lots')
    .select('lot_id, triage_max_bid, lots(closes_at)')
    .eq('analysis_id', analysisId);
  if (error) throw new Error(`Could not read the analysis lots: ${error.message}`);

  const lots: ScorableLot[] = (data ?? []).map((row) => {
    const targetBid = row.triage_max_bid === null ? null : Number(row.triage_max_bid);
    return {
      id: row.lot_id,
      targetBid: Number.isFinite(targetBid) ? targetBid : null,
      // The evidence threshold is what decides a range exists at all, so a lot
      // with a bid figure has already cleared it. Until the confidence score
      // itself is stored, a valued lot counts as medium and an unvalued one
      // as insufficient, which is the honest reading of what we know.
      confidence: targetBid === null ? 'insufficient' : bandForScore(60),
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
export async function readContext(
  analysisId: string,
  orgId: string,
): Promise<ValuingContext> {
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

    const lots = await step.run('read-identifications', async () => {
      const supabase = createServiceSupabase();
      const { data, error } = await supabase
        .from('lot_identifications')
        .select('lot_id, brand, model, year, specs, lots(title, raw)')
        .eq('analysis_id', analysisId)
        .eq('is_current', true);
      if (error) throw new Error(`Could not read the identifications: ${error.message}`);
      return (data ?? []) as unknown as LotToValue[];
    });

    const context = await step.run('read-context', async () =>
      readContext(analysisId, orgId),
    );

    let valued = 0;
    let withoutEvidence = 0;
    let stoppedForSpend = false;

    for (let start = 0; start < lots.length; start += AT_A_TIME) {
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
        lots.slice(start, start + AT_A_TIME).map((lot) =>
          step
            .run(`value-${lot.lot_id}`, async () => ({
              valued: await valueAndStore(lot, { orgId, analysisId }, context),
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

    return { analysisId, lots: lots.length, valued, withoutEvidence, stoppedForSpend };
  },
);
