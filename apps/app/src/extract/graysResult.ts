// Reading what a past Grays lot actually sold for. Decision record 0020.
//
// A closed lot page states it plainly:
//
//   **Closed:**
//   **25 September 2026 21:00 AEST**
//   Sold for
//   $260
//   The auction has ended.
//   Bids (20 bids)
//
// This is the best evidence triage can have. It is a sold price rather than an
// asking price, so matching-and-valuation.md weights it 0.95 against 0.6. It
// carries a date, so recency weighting has something to work with, where a web
// search gives none. And it is the same auction house, the same buyers and the
// same condition of goods as the lot being valued.
//
// One thing it is not. The spec calls an auction result a "resale floor and
// auction market". It says what a thing fetches under the hammer, not what it
// fetches on a forecourt, and the gap between those is the margin a reseller
// works in.

import { parseGraysClose } from './graysDates';

export type GraysResult = {
  /** The hammer price. The premium is not in it, and the page says so. */
  hammerPrice: number;
  /** When the lot closed, in UTC. */
  closedAt: string;
  /** How many bids it drew. A lot with one bid says less than one with 400. */
  bidCount: number | null;
  /** The odometer, where the page states one. */
  kilometres: number | null;
};

const SOLD_FOR = /Sold for\s*\n+\s*\$([\d,]+(?:\.\d{2})?)/i;
const CLOSED_AT = /\*\*Closed:\*\*\s*\n+\s*\*\*([^*]+)\*\*/i;
const BID_COUNT = /Bids\s*\((\d+)\s*bids?\)/i;
const ODOMETER = /Odometer Reading:?\s*([\d,]+)/i;

/** Wording that means the lot did not sell. */
const NOT_SOLD = /\b(unsold|passed in|no sale|did not sell|reserve not met)\b/i;

/**
 * How much of the page around the price counts as the result.
 *
 * The first version tested the whole page, and Grays' bidding terms tell every
 * bidder a bid "cannot be altered or withdrawn". That one word appears on
 * every lot page whether it sold or not, and it rejected all four real sales
 * this was tried on. Only the words beside the price can contradict it.
 */
const AROUND_THE_PRICE = 300;

const number = (text: string) => Number(text.replace(/,/g, ''));

/**
 * Reads a past lot's result.
 *
 * Returns null unless the page states a sold price. A lot that was withdrawn
 * or passed in is not a sale, and recording it as one would put a price on
 * something nobody bought. A live lot is not a result either: its current bid
 * is a bid, not a price.
 */
export function parseGraysResult(markdown: string): GraysResult | null {
  // A sold price is the positive evidence. Its absence is what means the lot
  // did not sell, so that is tested first and no word list is needed for it.
  const match = markdown.match(SOLD_FOR);
  const sold = match?.[1];
  if (!sold || match?.index === undefined) return null;

  // Only the words around the price can contradict it. Anything further away
  // is terms and boilerplate.
  const nearby = markdown.slice(
    Math.max(0, match.index - AROUND_THE_PRICE),
    match.index + AROUND_THE_PRICE,
  );
  if (NOT_SOLD.test(nearby)) return null;

  const hammerPrice = number(sold);
  if (!Number.isFinite(hammerPrice) || hammerPrice <= 0) return null;

  // The close date is what makes this evidence rather than an anecdote, so a
  // result without a readable one is not kept.
  const closedText = markdown.match(CLOSED_AT)?.[1]?.trim();
  if (!closedText) return null;

  const closedAt = parseGraysClosedLine(closedText);
  if (!closedAt) return null;

  const bids = markdown.match(BID_COUNT)?.[1];
  const odometer = markdown.match(ODOMETER)?.[1];

  return {
    hammerPrice,
    closedAt,
    bidCount: bids ? number(bids) : null,
    kilometres: odometer ? number(odometer) : null,
  };
}

/**
 * Reads "25 September 2026 21:00 AEST" into an instant.
 *
 * A different shape from the catalogue's "25 Sep 26 9.00 PM AEST", so it is
 * rearranged into what parseGraysClose already understands rather than having
 * a second date reader with its own bugs.
 */
export function parseGraysClosedLine(text: string): string | null {
  const match = text
    .trim()
    .match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*([A-Z]{4})$/);
  if (!match) return null;

  const [, day, month, year, hour, minute, zone] = match;
  return parseGraysClose(`${day} ${month} ${year}`, `${hour}.${minute} ${zone}`)?.iso ?? null;
}

/** How old a result is, in days, which drives the recency weight. */
export function ageInDays(closedAt: string, now: Date = new Date()): number {
  const days = (now.getTime() - new Date(closedAt).getTime()) / 86_400_000;
  return Number.isFinite(days) ? Math.max(0, Math.round(days)) : 0;
}
