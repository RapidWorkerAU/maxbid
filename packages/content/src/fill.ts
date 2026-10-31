// Putting figures into a standard message. WR08, and rule 7 of AGENTS.md.
//
// Disclaimer text is never typed into a component, so a message with a gap in
// it needs a way to fill the gap without rewriting the sentence somewhere
// else. DS17 is the first one that needs it: "You excluded [number]
// comparables. The expected resale changed from [amount] to [amount]."
//
// Filled by position rather than by name, because that sentence has two
// amounts meaning different things and a name could not tell them apart.

import { DS17 } from './disclaimers';

export class UnfilledMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnfilledMessageError';
  }
}

/** Anything in square brackets is a gap waiting for a figure. */
const GAP = /\[[a-z]+\]/gi;

/**
 * Fills the gaps in a standard message, left to right.
 *
 * Throws when the count does not match. A disclaimer showing "[amount]" to a
 * user is worse than an error: it is a figure we promised and did not give,
 * in the one kind of text that exists to be precise.
 */
export function fill(message: string, values: (string | number)[]): string {
  const gaps = message.match(GAP) ?? [];
  if (gaps.length !== values.length) {
    throw new UnfilledMessageError(
      `That message has ${gaps.length} ${gaps.length === 1 ? 'gap' : 'gaps'} and ${values.length} were given.`,
    );
  }

  let index = 0;
  return message.replace(GAP, () => String(values[index++]));
}

/**
 * DS17, said correctly for one comparable as well as for several.
 *
 * The stock wording is plural, and filled with a 1 it reads "You excluded 1
 * comparables", which is the kind of sentence that makes a reader wonder what
 * else we were careless about. The words are DS17's own and the number
 * agreement is grammar rather than new copy, so the fix belongs here with the
 * message instead of in a component.
 */
export function exclusionNote(excluded: number, before: string, after: string): string {
  const message = excluded === 1 ? DS17.replace('comparables', 'comparable') : DS17;
  return fill(message, [excluded, before, after]);
}
