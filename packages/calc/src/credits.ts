// What a shortlist costs, and whether it can be afforded. F17.
//
// One credit is one deep analysed lot, per commercial.md. The rules here are
// pure because they decide what somebody is charged, and because the answer
// has to be the same in the preview the user reads before confirming and in
// the reserve the pipeline takes afterwards. Two implementations of that
// would eventually disagree, and the user would be charged by the one they
// never saw.

/** One credit is one deep analysed lot. commercial.md. */
export const CREDITS_PER_LOT = 1;

export type ShortlistCost = {
  lots: number;
  credits: number;
  available: number;
  /** What is left afterwards. Negative is the shortfall. */
  remaining: number;
  affordable: boolean;
  /** How many more credits are needed. Nought when it is affordable. */
  shortfall: number;
};

/**
 * What a shortlist costs and whether the organisation can cover it.
 *
 * A negative balance is treated as nought rather than as debt. We do not lend
 * credits, so a balance below nought is an accident somewhere else, and
 * letting it make a shortlist look more affordable than it is would be the
 * wrong way to find out.
 */
export function shortlistCost(lots: number, available: number): ShortlistCost {
  const counted = Math.max(0, Math.floor(lots));
  const credits = counted * CREDITS_PER_LOT;
  const balance = Math.max(0, Math.floor(available));

  return {
    lots: counted,
    credits,
    available: balance,
    remaining: balance - credits,
    affordable: credits <= balance,
    shortfall: Math.max(0, credits - balance),
  };
}

/**
 * How many lots an organisation could afford to analyse.
 *
 * Used to say what is possible rather than to stop anybody. F17 blocks
 * confirming a shortlist that costs more than the balance; it does not stop
 * somebody ticking lots while they decide.
 */
export function lotsAffordable(available: number): number {
  return Math.max(0, Math.floor(available)) / CREDITS_PER_LOT;
}
