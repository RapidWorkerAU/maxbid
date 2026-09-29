// Reads one lot card from a Grays catalogue page.
//
// Grays serves at least two catalogue layouts. The older one is a bare link
// per lot, with prices and closing times listed separately further down the
// page. The motor vehicle sales use a card, where everything about a lot sits
// inside that lot's own link:
//
//   01. [![2014 Nissan QASHQAI](image)\
//       Ends in 6h: 51m: 51s\
//       Jandakot, WA\
//       No Reserve\
//       **2014 Nissan QASHQAI** \
//       Lot 2Used\
//       Current bid:\
//       **$809**](https://www.grays.com/lot/0002-23502418/...)
//
// A card is worth reading on its own terms, because every figure arrives
// beside the lot it belongs to. The older layout has to join prices to lots by
// position, and that is the part that can silently put one lot's bid against
// another. Nothing here can do that.

import { parseGraysCountdown } from './graysDates';

export type CardFields = {
  /** The bolded title inside the card, which is cleaner than the image alt. */
  title?: string;
  currentBid?: number;
  closesAt?: string;
  location?: string;
  noReserve?: boolean;
};

const BID = /Current bid:[\s\\]*\*\*\$([\d,]+(?:\.\d{2})?)\*\*/;
const COUNTDOWN = /Ends in ([^\n\\]+)/;
const TITLE = /\*\*([^*$][^*]*)\*\*/;
// Markdown line breaks leave a trailing backslash or two, so the state has to
// be allowed to end the line with those still attached.
const LOCATION = /^\s*([A-Za-z][A-Za-z '-]+,\s*(?:NSW|VIC|QLD|WA|SA|TAS|NT|ACT))\s*\\*\s*$/m;

/**
 * Reads what a card says about its lot.
 *
 * Every field is optional. A card that is missing one is reported as missing
 * rather than guessed at, so the completeness check can decide whether the
 * page is usable.
 *
 * @param body the markdown between the card's image and its closing link
 * @param fetchedAt when the page was fetched, which a countdown is relative to
 */
export function readCardBody(body: string, fetchedAt?: string): CardFields {
  const fields: CardFields = {};

  const bid = body.match(BID);
  if (bid?.[1]) {
    const value = Number(bid[1].replace(/,/g, ''));
    if (Number.isFinite(value)) fields.currentBid = value;
  }

  const countdown = body.match(COUNTDOWN);
  if (countdown?.[1] && fetchedAt) {
    const closes = parseGraysCountdown(countdown[1], fetchedAt);
    if (closes) fields.closesAt = closes;
  }

  // The first bold run that is not the price is the lot title.
  const title = body.match(TITLE);
  if (title?.[1]) fields.title = title[1].trim();

  const location = body.match(LOCATION);
  if (location?.[1]) fields.location = location[1].trim();

  if (/\bNo Reserve\b/.test(body)) fields.noReserve = true;

  return fields;
}

/** True when this body carries card fields rather than being an empty link. */
export function looksLikeCard(body: string): boolean {
  return BID.test(body) || COUNTDOWN.test(body);
}
