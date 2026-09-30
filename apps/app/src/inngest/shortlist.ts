// Choosing which lots are worth paying to value. S5.
//
// Valuing a lot costs a search, a model call and up to four page fetches, and
// the extraction service allows eight fetches a minute. On the first real
// catalogue that worked out at forty five minutes for 36 lots, which is six
// hours for the 300 lot sale unit-costs.md treats as normal. A sale closing
// tonight would still be being analysed.
//
// So every lot is identified, which is fast and costs almost nothing, and only
// the lots worth bidding on are valued. Nobody analyses three hundred lots.

/** What we know about a lot before anything has been valued. */
export type LotToConsider = {
  lotId: string;
  /** What it is bid to now. Null where nobody has bid. */
  currentBid: number | null;
  /** True where triage could not say what the lot is. */
  unidentified?: boolean;
};

/**
 * How many lots of a catalogue are valued.
 *
 * Thirty is the number of lots unit-costs.md assumes a user sends to deep
 * analysis from a 300 lot sale, so it is the number they are plausibly
 * choosing between. It also brings a full catalogue inside an hour.
 */
export const LOTS_TO_VALUE = 30;

/**
 * The lots worth valuing, best guess first.
 *
 * Ordered on the current bid, which decision record 0023 rules out for
 * ranking and which is still the only signal available here. The distinction
 * matters. As a measure of **headroom** it is worthless, because bidders wait
 * until the end and an early bid says how early we looked. As a rough measure
 * of **what kind of thing this is**, it holds: the RAM bid to $22,100 was
 * always a bigger lot than the Fiat bid to $409, and both trebled.
 *
 * So this decides where to spend the fetches, not what to recommend. The
 * ranking that reaches the user is worked out afterwards, from the valuations
 * themselves.
 */
export function lotsWorthValuing(
  lots: LotToConsider[],
  limit = LOTS_TO_VALUE,
): LotToConsider[] {
  return lots
    .filter((lot) => !lot.unidentified)
    .slice()
    .sort((a, b) => {
      const bidA = a.currentBid ?? 0;
      const bidB = b.currentBid ?? 0;
      if (bidA !== bidB) return bidB - bidA;
      // Stable, so the same catalogue picks the same lots twice running.
      return a.lotId.localeCompare(b.lotId);
    })
    .slice(0, limit);
}

/** The sentence telling the user which lots were left out, and why. */
export function shortlistNote(considered: number, valued: number): string | null {
  if (valued >= considered) return null;
  return `We worked out what every lot is, and what the ${valued} most likely to be worth your time are worth. The other ${considered - valued} are listed without a valuation. Ask for one on any of them.`;
}
