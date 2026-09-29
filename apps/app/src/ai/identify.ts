// Working out what a lot actually is. F13, S4, decision record 0017.
//
// The prompt and the reading of its answer live here, apart from the Claude
// client, so both can be tested without a network or a bill.
//
// Decision record 0017: the text is read first and the photo only where
// confidence comes back low. So this has to produce a confidence figure that
// means something, and the prompt says plainly what low means.

/** Changing the prompt changes the answers, so every run records which one. */
export const IDENTIFY_PROMPT_VERSION = 'triage-identify-1';

/** What we know about a lot before anyone has looked at it. */
export type LotForIdentification = {
  lotNumber: string;
  title: string;
  /** Anything the catalogue carried, such as odometer, transmission or fuel. */
  details?: Record<string, unknown>;
};

export type Identification = {
  brand: string | null;
  model: string | null;
  year: number | null;
  specs: Record<string, unknown>;
  conditionNotes: string | null;
  /** 0 to 100. Below the threshold the lot is read again with its photo. */
  confidence: number;
};

/**
 * The confidence below which a lot is worth paying to look at.
 *
 * A setting rather than a constant, because the right value is not knowable in
 * advance and the figures in ai_runs will say what it should be.
 */
export const PHOTO_PASS_BELOW = 70;

export const SYSTEM_PROMPT = [
  'You identify items being sold at Australian auctions, from the words the',
  'catalogue uses. You are the first and cheapest pass, so you are not asked',
  'to value anything or to guess at anything you cannot see.',
  '',
  'Reply with JSON only, in this shape:',
  '{"brand": string|null, "model": string|null, "year": number|null,',
  ' "specs": object, "conditionNotes": string|null, "confidence": number}',
  '',
  'Rules:',
  '1. Use null where the catalogue does not say. Never invent a brand, a model',
  '   or a year. A null is a useful answer and a guess is not.',
  '2. Put anything else the catalogue states into specs, such as fuel,',
  '   transmission, odometer, capacity or size. Use the words the catalogue',
  '   uses rather than tidying them.',
  '3. conditionNotes carries only what the catalogue states about condition or',
  '   damage, such as a written off vehicle marker. Leave it null otherwise.',
  '4. confidence is 0 to 100, and it is your confidence that brand, model and',
  '   year are right. Use below 70 when the words are vague, when a photo',
  '   would settle it, or when the item could be one of several things.',
].join('\n');

/** The words the model is asked to read. */
export function userPromptFor(lot: LotForIdentification): string {
  const details = Object.entries(lot.details ?? {})
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${String(value)}`);

  return [
    `Lot number: ${lot.lotNumber}`,
    `Title: ${lot.title}`,
    ...(details.length > 0 ? ['Catalogue details:', ...details] : []),
  ].join('\n');
}

export class IdentificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IdentificationError';
  }
}

const asText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Reads the model's answer.
 *
 * Refuses anything it cannot read rather than filling in blanks, because a
 * half read identification is worse than none: it looks like an answer and
 * everything downstream treats it as one.
 */
export function readIdentification(reply: string): Identification {
  // Models sometimes wrap JSON in a code fence however firmly they are asked
  // not to, so the fence is stripped rather than treated as a failure.
  const cleaned = reply.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new IdentificationError('The model did not reply with JSON.');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new IdentificationError('The model replied with JSON that is not an object.');
  }

  const row = parsed as Record<string, unknown>;

  // Tested as a number before it is converted. Number(null) is 0, which would
  // read as a real score of nought, send the lot for a photo pass it never
  // earned, and store a figure the model never gave.
  const confidence = typeof row.confidence === 'number' ? row.confidence : Number.NaN;
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
    // Without a usable confidence we cannot tell whether to look at the photo,
    // and we would be storing a number that means nothing.
    throw new IdentificationError('The model gave no usable confidence figure.');
  }

  const year = row.year === null || row.year === undefined ? null : Number(row.year);
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2100)) {
    throw new IdentificationError(`The model gave a year we cannot use: ${String(row.year)}.`);
  }

  const specs =
    typeof row.specs === 'object' && row.specs !== null && !Array.isArray(row.specs)
      ? (row.specs as Record<string, unknown>)
      : {};

  return {
    brand: asText(row.brand),
    model: asText(row.model),
    year,
    specs,
    conditionNotes: asText(row.conditionNotes),
    confidence,
  };
}

/** True when the lot is worth reading again with its photo. */
export function needsPhotoPass(identification: Identification, threshold = PHOTO_PASS_BELOW) {
  return identification.confidence < threshold;
}
