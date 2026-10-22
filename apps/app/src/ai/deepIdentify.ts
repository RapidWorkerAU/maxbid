// Reading a lot's photographs to work out what it is. F18, S8, D10.
//
// The triage pass reads the catalogue line and glances at one thumbnail. This
// one reads the photographs, because D10 says a model number is often only
// legible on a compliance plate in a picture and the catalogue line rarely
// carries it.
//
// It matters more than it looks. Everything downstream is built on what the
// lot is: the search terms, which comparables count as the same thing, and
// the match level that weighs them. An identification that is wrong in the
// variant makes every figure after it wrong in a way nothing else catches.
//
// The prompt and the reading of its answer live here, apart from the Claude
// client, so both can be tested without a network or a bill.

import { IdentificationError, type Identification } from './identify';

/** Changing the prompt changes the answers, so every run records which one. */
export const DEEP_IDENTIFY_PROMPT_VERSION = 'deep-identify-1';

export const DEEP_SYSTEM_PROMPT = [
  'You identify items in Australian auction photographs so their resale value',
  'can be estimated. You are given every photograph of one lot and whatever',
  'the catalogue said about it.',
  '',
  'Read the photographs for what the words do not say. Compliance plates,',
  'build plates, serial and model labels, badges, odometers and trim markings',
  'carry the detail that decides what an item is worth, and the catalogue',
  'line usually leaves it out.',
  '',
  'Report what you can see. Where a plate is legible, say what it says. Where',
  'the photographs do not show something, leave it out rather than supplying',
  'the usual answer for that kind of item: a specification you assumed will be',
  'searched for and priced as though somebody had read it.',
  '',
  'Confidence is 0 to 100 and is about the identification, not the item. 90 or',
  'more means you read the make, model and variant off the item itself. 60 to',
  '89 means the photographs agree with the catalogue but you could not confirm',
  'the variant. Below 60 means you are reasoning from the general appearance.',
  '',
  'Reply with JSON only, no code fence, with these keys: brand, model, year,',
  'variant, specs, conditionNotes, readFromPlate, confidence.',
].join('\n');

export type DeepSubject = {
  lotNumber: string;
  title: string;
  /** What triage already decided, which this either confirms or corrects. */
  triage?: { brand: string | null; model: string | null; year: number | null };
  /** Anything the catalogue stated, such as odometer or transmission. */
  details?: Record<string, unknown>;
};

export function deepPromptFor(subject: DeepSubject, photoCount: number): string {
  const said = Object.entries(subject.details ?? {})
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n');

  return [
    `Lot ${subject.lotNumber}.`,
    `The catalogue calls it: ${subject.title}`,
    said ? `The catalogue also states:\n${said}` : 'The catalogue states nothing else.',
    subject.triage?.brand
      ? `A first pass on the words alone read it as: ${[subject.triage.year, subject.triage.brand, subject.triage.model].filter(Boolean).join(' ')}. Confirm or correct that from the photographs.`
      : 'Nothing has identified it yet.',
    `There ${photoCount === 1 ? 'is 1 photograph' : `are ${photoCount} photographs`} above, in the order the listing shows them.`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export type DeepIdentification = Identification & {
  /** The variant or trim, which is what the catalogue line usually omits. */
  variant: string | null;
  /** What was legible on a plate or label, in the model's own words. */
  readFromPlate: string | null;
};

/**
 * Reads the model's answer.
 *
 * Built on the triage reader's rules rather than beside them, because the two
 * answer the same question and a second set of rules would eventually
 * disagree with the first about what a usable confidence figure is.
 */
export function readDeepIdentification(reply: string): DeepIdentification {
  const cleaned = reply
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

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
  // read as a real score of nought and store a figure the model never gave.
  const confidence = typeof row.confidence === 'number' ? row.confidence : Number.NaN;
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
    throw new IdentificationError('The model gave no usable confidence figure.');
  }

  const year = row.year === null || row.year === undefined ? null : Number(row.year);
  const text = (value: unknown) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

  return {
    brand: text(row.brand),
    model: text(row.model),
    variant: text(row.variant),
    year: Number.isFinite(year) && year !== null ? year : null,
    specs:
      typeof row.specs === 'object' && row.specs !== null && !Array.isArray(row.specs)
        ? (row.specs as Record<string, unknown>)
        : {},
    conditionNotes: text(row.conditionNotes),
    readFromPlate: text(row.readFromPlate),
    confidence,
  };
}
