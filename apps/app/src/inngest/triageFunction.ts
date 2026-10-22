// S4 Triage identify, as an Inngest function.
// Source: docs/02-specs/pipeline.md. F13, decision records 0017 and 0024.
//
// What a lot is does not depend on who is asking, so an identification is the
// shared baseline every organisation reads, and a lot somebody has already
// had identified is skipped rather than paid for again.

import { createServiceSupabase } from '@maxbid/db/server';
import { SpendCeilingError } from '../ai/pricing';
import { inngest, triageRequested, valueRequested } from './client';
import { alreadyIdentified, storeBaseline } from './sharedIdentification';
import { assertBudgetLeft, identifyLot } from './triage';

/** How many lots are identified at once. Kind to the API and to the database. */
const AT_A_TIME = 5;

/** The primary photo, which decision record 0017 reads only when unsure. */
function photoFrom(raw: unknown): string | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const url = (raw as Record<string, unknown>).imageUrl;
  return typeof url === 'string' && url.length > 0 ? url : undefined;
}

/**
 * Every lot in the sale, and the ones we cannot already name.
 *
 * A lot somebody has already had identified costs nothing here, because what
 * a lot is does not depend on who is asking. On a sale another organisation
 * has looked at, or one read by the nightly crawl, `toRead` is empty and this
 * stage spends nothing at all.
 *
 * Returns an array rather than a Set: a step result is serialised on its way
 * back from Inngest and a Set does not survive that.
 */
async function readLots(auctionId: string) {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from('lots')
    .select('id, lot_number, title, raw')
    .eq('auction_id', auctionId)
    .order('lot_number');
  if (error) throw new Error(`Could not read the lots: ${error.message}`);

  const all = data ?? [];
  const known = await alreadyIdentified(all.map((lot) => lot.id));
  return {
    all,
    known: [...known],
    toRead: all.filter((lot) => !known.has(lot.id)),
  };
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

    const read = await step.run('read-lots', async () => readLots(auctionId));
    const lots = read.toRead;

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
              await storeBaseline(result);
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

    // S5 works out what each lot is worth. Not sent when triage stopped for
    // spend, because the ceiling is a limit on the analysis and not on a stage.
    //
    // The test is how many lots we can now name, not how many this run named.
    // A sale where every lot was already identified names none and still has
    // everything the valuation stage needs, and reading `identified` here
    // would have left exactly that sale with no valuation at all.
    const nameable = read.known.length + identified;
    if (!stoppedForSpend && nameable > 0) {
      await step.sendEvent('start-valuation', {
        name: valueRequested.name,
        data: { analysisId, orgId },
      });
    }

    return {
      analysisId,
      lots: read.all.length,
      identified,
      alreadyKnown: read.known.length,
      failed,
      withPhoto,
      stoppedForSpend,
    };
  },
);
