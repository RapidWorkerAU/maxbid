// S4 Triage identify. Source: docs/02-specs/pipeline.md. F13, decision record 0017.
//
// One step per lot, so a lot that fails takes only itself down. The spend
// ceiling is checked before each lot rather than after, so it limits what is
// spent rather than reporting what was.

import { ask, spentOnAnalysis } from '../ai/claude';
import {
  IDENTIFY_PROMPT_VERSION,
  SYSTEM_PROMPT,
  needsPhotoPass,
  readIdentification,
  userPromptFor,
  type Identification,
  type LotForIdentification,
} from '../ai/identify';
import { DEFAULT_ANALYSIS_CEILING_USD, TRIAGE_MODEL, assertWithinCeiling } from '../ai/pricing';

export const STAGE = 'S4';

/** What the catalogue already told us, pulled out of the stored lot row. */
export function detailsFrom(raw: unknown): LotForIdentification['details'] {
  if (typeof raw !== 'object' || raw === null) return {};
  const row = raw as Record<string, unknown>;
  const keep = ['currentBid', 'location', 'noReserve', 'closesAt'];
  const details: Record<string, unknown> = {};
  for (const key of keep) {
    if (row[key] !== undefined && row[key] !== null) details[key] = row[key];
  }

  // The labelled facts the catalogue stated, such as the odometer reading.
  // Leaving these out cost a valuation: a Landcruiser showing 549,752
  // kilometres was priced against ordinary ones, because nothing downstream
  // knew what it had done.
  const attributes = row.attributes;
  if (typeof attributes === 'object' && attributes !== null) {
    for (const [key, value] of Object.entries(attributes)) {
      if (value !== null && value !== undefined && value !== '') details[key] = value;
    }
  }

  return details;
}

export type IdentifiedLot = {
  lotId: string;
  identification: Identification;
  aiRunId: string | null;
  costUsd: number;
  /** True when the first answer was unsure and the photo was read as well. */
  usedPhoto: boolean;
};

/**
 * Identifies one lot, reading its photo only if the words were not enough.
 * Decision record 0017.
 */
export async function identifyLot(
  lot: { id: string; lot_number: string; title: string; raw: unknown },
  where: { orgId: string; analysisId: string },
  photoUrl?: string,
): Promise<IdentifiedLot> {
  const prompt = userPromptFor({
    lotNumber: lot.lot_number,
    title: lot.title,
    details: detailsFrom(lot.raw),
  });
  const record = {
    stage: STAGE,
    promptVersion: IDENTIFY_PROMPT_VERSION,
    orgId: where.orgId,
    analysisId: where.analysisId,
    lotId: lot.id,
  };

  const first = await ask(
    { model: TRIAGE_MODEL, system: SYSTEM_PROMPT, prompt, maxTokens: 512 },
    record,
  );
  let identification = readIdentification(first.text);
  let aiRunId = first.aiRunId;
  let costUsd = first.costUsd;
  let usedPhoto = false;

  if (needsPhotoPass(identification) && photoUrl) {
    const second = await ask(
      {
        model: TRIAGE_MODEL,
        system: SYSTEM_PROMPT,
        prompt: `${prompt}\n\nThe photo of this lot is attached. Use it to settle what the words left unclear.`,
        maxTokens: 512,
        imageUrl: photoUrl,
      },
      record,
    );
    identification = readIdentification(second.text);
    aiRunId = second.aiRunId;
    costUsd += second.costUsd;
    usedPhoto = true;
  }

  return { lotId: lot.id, identification, aiRunId, costUsd, usedPhoto };
}

// Storing an identification now lives in sharedIdentification.ts, because an
// identification belongs to the lot rather than to whichever analysis
// happened to ask first. Decision record 0024.

/** Refuses to start another lot once the analysis has spent its limit. */
export async function assertBudgetLeft(analysisId: string, ceiling = DEFAULT_ANALYSIS_CEILING_USD) {
  assertWithinCeiling(await spentOnAnalysis(analysisId), ceiling);
}
