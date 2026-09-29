// S4 Triage identify, as an Inngest function.
// Source: docs/02-specs/pipeline.md. F13, decision record 0017.

import { createServiceSupabase } from '@maxbid/db/server';
import { SpendCeilingError } from '../ai/pricing';
import { inngest, triageRequested } from './client';
import { assertBudgetLeft, identifyLot, storeIdentification } from './triage';

/** How many lots are identified at once. Kind to the API and to the database. */
const AT_A_TIME = 5;

/** The primary photo, which decision record 0017 reads only when unsure. */
function photoFrom(raw: unknown): string | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const url = (raw as Record<string, unknown>).imageUrl;
  return typeof url === 'string' && url.length > 0 ? url : undefined;
}

export const triage = inngest.createFunction(
  {
    id: 'triage-identify',
    name: 'S4 Triage identify',
    triggers: [{ event: triageRequested }],
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
    const { analysisId, auctionId, orgId } = event.data;

    const lots = await step.run('read-lots', async () => {
      const supabase = createServiceSupabase();
      const { data, error } = await supabase
        .from('lots')
        .select('id, lot_number, title, raw')
        .eq('auction_id', auctionId)
        .order('lot_number');
      if (error) throw new Error(`Could not read the lots: ${error.message}`);
      return data ?? [];
    });

    let identified = 0;
    let failed = 0;
    let withPhoto = 0;
    let stoppedForSpend = false;

    for (let start = 0; start < lots.length; start += AT_A_TIME) {
      if (stoppedForSpend) break;
      const batch = lots.slice(start, start + AT_A_TIME);

      // Checked before the batch, so the ceiling limits what is spent rather
      // than reporting what already was.
      const roomLeft = await step.run(`budget-${start}`, async () => {
        try {
          await assertBudgetLeft(analysisId);
          return { ok: true as const };
        } catch (cause) {
          if (cause instanceof SpendCeilingError) return { ok: false as const, why: cause.message };
          throw cause;
        }
      });

      if (!roomLeft.ok) {
        stoppedForSpend = true;
        break;
      }

      const results = await Promise.all(
        batch.map((lot) =>
          step
            .run(`identify-${lot.lot_number}`, async () => {
              const result = await identifyLot(lot, { orgId, analysisId }, photoFrom(lot.raw));
              await storeIdentification(analysisId, result);
              return { ok: true as const, usedPhoto: result.usedPhoto };
            })
            // One lot that cannot be read must not stop the other 299. The
            // failure is already recorded against that lot in ai_runs.
            .catch(() => ({ ok: false as const, usedPhoto: false })),
        ),
      );

      for (const result of results) {
        if (result.ok) identified += 1;
        else failed += 1;
        if (result.usedPhoto) withPhoto += 1;
      }
    }

    await step.run('mark-triaged', async () => {
      const supabase = createServiceSupabase();
      const { error } = await supabase
        .from('analyses')
        .update({
          // Stopping for spend is not a finished triage, and saying it was
          // would hide the reason the later stages have nothing to work with.
          status: stoppedForSpend ? 'failed' : 'triaged',
          progress_pct: stoppedForSpend ? 25 : 50,
        })
        .eq('id', analysisId);
      if (error) throw new Error(`Could not update the analysis: ${error.message}`);
    });

    return { analysisId, lots: lots.length, identified, failed, withPhoto, stoppedForSpend };
  },
);
