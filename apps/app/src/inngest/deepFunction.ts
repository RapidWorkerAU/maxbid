// S8 Deep identify, as an Inngest function. F18, F19, D10, D11.
//
// Runs on the lots somebody shortlisted, not on a catalogue. Each lot costs a
// page fetch for its photographs and a call to the larger model to read them,
// which is why a credit pays for one lot and why this never runs on three
// hundred of them at once.
//
// The order matters. Credits are taken before any work, because a run that
// spends money and then finds it could not afford to has already spent it.
// What cannot be analysed is refunded at the end, because commercial.md says
// a failed lot is refunded automatically and nobody should have to ask.

import { createServiceSupabase } from '@maxbid/db/server';
import { ask } from '../ai/claude';
import {
  DEEP_IDENTIFY_PROMPT_VERSION,
  DEEP_SYSTEM_PROMPT,
  deepPromptFor,
  readDeepIdentification,
} from '../ai/deepIdentify';
import { DEEP_MODEL } from '../ai/pricing';
import { deepRequested, inngest } from './client';
import { NotEnoughCreditsError, refundCredits, reserveCredits } from './credits';
import { collectPhotos, photosFor } from './photos';
import { storeBaseline } from './sharedIdentification';

export const STAGE = 'S8';

/** How many lots are read at once. Each one fetches a page and reads photos. */
const AT_A_TIME = 2;

/**
 * Reads one lot's photographs and stores what it saw.
 *
 * Returns false where there was nothing to read. A lot listed without
 * photographs is not a failure of the model, and it is refunded like any
 * other lot we could not analyse.
 */
export async function identifyFromPhotos(
  lot: { id: string; title: string; source_url: string | null; lot_number: string; raw: unknown },
  where: { orgId: string; analysisId: string },
): Promise<boolean> {
  await collectPhotos(lot);
  const photos = await photosFor(lot.id);
  if (photos.length === 0) return false;

  const details = (lot.raw as { attributes?: Record<string, unknown> })?.attributes ?? {};

  const reply = await ask(
    {
      model: DEEP_MODEL,
      system: DEEP_SYSTEM_PROMPT,
      prompt: deepPromptFor(
        { lotNumber: lot.lot_number, title: lot.title, details },
        photos.length,
      ),
      imageUrls: photos,
      maxTokens: 1500,
    },
    {
      stage: STAGE,
      promptVersion: DEEP_IDENTIFY_PROMPT_VERSION,
      orgId: where.orgId,
      analysisId: where.analysisId,
      lotId: lot.id,
    },
  );

  const seen = readDeepIdentification(reply.text);

  // Stored as the shared baseline, superseding what triage read off the words.
  // What a lot is does not depend on who is asking, and a reading taken from
  // the item's own plate is better than one taken from a catalogue line, so
  // everybody gets it.
  await storeBaseline({
    lotId: lot.id,
    identification: {
      brand: seen.brand,
      model: seen.model,
      year: seen.year,
      // The variant and what was legible on the plate go in the specs, where
      // the valuation reads them, because the variant is usually the thing
      // that decides what a used item is worth.
      specs: {
        ...seen.specs,
        ...(seen.variant ? { variant: seen.variant } : {}),
        ...(seen.readFromPlate ? { readFromPlate: seen.readFromPlate } : {}),
      },
      conditionNotes: seen.conditionNotes,
      confidence: seen.confidence,
    },
    aiRunId: reply.aiRunId,
    costUsd: reply.costUsd,
    usedPhoto: true,
  });

  return true;
}

export const deepIdentify = inngest.createFunction(
  {
    id: 'deep-identify',
    name: 'S8 Deep identify',
    triggers: [{ event: deepRequested }],
    concurrency: { key: 'event.data.analysisId', limit: 1 },
    retries: 1,
    onFailure: async ({ event, step }) => {
      // A run that died owes the credits back. Without this a failure would
      // charge for work that never happened, which is the one thing a ledger
      // must never record.
      const { analysisId, orgId, lotIds } = event.data.event.data;
      await step.run('refund-everything', async () =>
        refundCredits(orgId, analysisId, lotIds.length),
      );
    },
  },
  async ({ event, step }) => {
    const { analysisId, orgId, lotIds } = event.data;
    if (lotIds.length === 0) return { analysisId, read: 0, refunded: 0 };

    const reserved = await step.run('reserve-credits', async () => {
      try {
        return await reserveCredits(orgId, analysisId, lotIds.length);
      } catch (cause) {
        if (cause instanceof NotEnoughCreditsError) return null;
        throw cause;
      }
    });
    if (reserved === null) {
      return { analysisId, read: 0, refunded: 0, notEnoughCredits: true };
    }

    const lots = await step.run('read-lots', async () => {
      const { data, error } = await createServiceSupabase()
        .from('lots')
        .select('id, lot_number, title, source_url, raw')
        .in('id', lotIds);
      if (error) throw new Error(`Could not read the lots: ${error.message}`);
      return data ?? [];
    });

    let read = 0;
    for (let start = 0; start < lots.length; start += AT_A_TIME) {
      const batch = lots.slice(start, start + AT_A_TIME);
      const results = await Promise.all(
        batch.map((lot) =>
          step
            .run(`identify-${lot.id}`, async () => identifyFromPhotos(lot, { orgId, analysisId }))
            // One lot that cannot be read must not stop the others, and it is
            // refunded below rather than charged for.
            .catch(() => false),
        ),
      );
      read += results.filter(Boolean).length;
    }

    const refunded = await step.run('refund-what-we-could-not-read', async () =>
      refundCredits(orgId, analysisId, lotIds.length - read),
    );

    return { analysisId, read, refunded, reserved };
  },
);
