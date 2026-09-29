// Reads a Grays catalogue page.
//
// Firecrawl's own AI extraction was tried first and returned 13 lots from a
// page holding 90, silently. F07 wants every lot with correct lot numbers and
// the metrics target 98 percent completeness, so the markdown is parsed here
// instead. The markdown is labelled text rather than CSS selectors, which
// makes it steadier than it sounds.
//
// Grays serves two catalogue layouts, and both start each lot the same way:
// an image link wrapped in a link to the lot.
//
//   Card layout, used by the motor vehicle sales. Everything about the lot is
//   inside its own link, so nothing has to be matched up afterwards:
//
//     [![TITLE](image)\
//      Ends in 6h: 51m: 51s\
//      Current bid:\
//      **$809**](https://www.grays.com/lot/0002-23502418/...)
//
//   List layout. The link holds nothing but the image, and the page carries
//   three parallel sequences:
//
//     [![TITLE](image)](https://www.grays.com/lot/0001-23502297/...)
//     $150
//     **Lot No:** 0001-23502297
//     **Closes:** 25 Sep 26 [9.00 PM AEST](...)
//
// Closing times key off the lot number in either layout. Bids in the list
// layout have no lot number beside them, so they join by position, which is
// the fragile part and exactly what the completeness check exists to catch.
// Cards never take that path.

import { looksLikeCard, readCardBody } from './graysCard';
import { parseGraysClose } from './graysDates';

export type ParsedLot = {
  lotNumber: string;
  title: string;
  lotUrl: string;
  imageUrl?: string;
  currentBid?: number;
  closesAt?: string;
  location?: string;
  noReserve?: boolean;
  /** Labelled facts from the card, such as odometer, transmission and fuel. */
  attributes?: Record<string, string>;
  /**
   * Where the closing time came from. A countdown is relative to the fetch,
   * so it is only as exact as that, and S3 should prefer a listed time.
   */
  closesAtSource?: 'listed' | 'countdown';
};

export type ParsedCatalogue = {
  lots: ParsedLot[];
  /** Which layout the page turned out to be, for the record and for tests. */
  layout: 'card' | 'list' | 'empty';
  /** What the page said it held, so the caller can check nothing was lost. */
  counts: {
    lotBlocks: number;
    prices: number;
    closingTimes: number;
    /**
     * The highest position Grays numbered a card, in the card layout. The
     * cards are an ordered list, so the page numbers them itself, and that
     * number is independent of how many we managed to read.
     */
    highestPosition?: number;
  };
};

// The body between the image and the closing link is empty in the list layout
// and full of card fields in the card layout, so one expression reads both.
const LOT_BLOCK =
  /\[!\[([^\]]*)\]\(([^)\s]*)\)([\s\S]*?)\]\((https:\/\/www\.grays\.com\/lot\/([\w-]+)\/[^)]*)\)/g;
// Cards arrive as a numbered list, and Grays writes the numbers. They are the
// only thing on the page that says how many cards there should be.
const CARD_POSITION = /^[ \t]*(\d+)\.[ \t]+\[!\[/gm;
const PRICE = /\$([\d,]+(?:\.\d{2})?)/g;
const CLOSING = /\*\*Lot No:\*\*\s*([\w-]+)\s*\n+\s*\*\*Closes:\*\*\s*([^[\n]+)\[([^\]]+)\]/g;

/**
 * @param markdown the page as Firecrawl returned it
 * @param fetchedAt when it was fetched, which the card layout needs to turn a
 *   countdown into a closing time. Without it, cards have no closing time.
 */
export function parseGraysCatalogue(markdown: string, fetchedAt?: string): ParsedCatalogue {
  const lots: ParsedLot[] = [];
  const seen = new Set<string>();
  let cards = 0;

  for (const match of markdown.matchAll(LOT_BLOCK)) {
    const [, altText, imageUrl, body, lotUrl, lotNumber] = match;
    if (!lotNumber || seen.has(lotNumber)) continue;
    seen.add(lotNumber);

    const lot: ParsedLot = {
      lotNumber,
      title: (altText ?? '').trim(),
      lotUrl: lotUrl ?? '',
      imageUrl: imageUrl || undefined,
    };

    if (looksLikeCard(body ?? '')) {
      cards += 1;
      const fields = readCardBody(body ?? '', fetchedAt);
      if (fields.title) lot.title = fields.title;
      if (fields.currentBid !== undefined) lot.currentBid = fields.currentBid;
      if (fields.closesAt) {
        lot.closesAt = fields.closesAt;
        lot.closesAtSource = 'countdown';
      }
      if (fields.location) lot.location = fields.location;
      if (fields.noReserve) lot.noReserve = true;
      if (fields.attributes) lot.attributes = fields.attributes;
    }

    lots.push(lot);
  }

  const layout = lots.length === 0 ? 'empty' : cards === lots.length ? 'card' : 'list';
  if (layout === 'card') {
    const positions = [...markdown.matchAll(CARD_POSITION)].map((m) => Number(m[1]));
    return {
      lots,
      layout,
      counts: {
        lotBlocks: lots.length,
        prices: lots.filter((lot) => lot.currentBid !== undefined).length,
        closingTimes: lots.filter((lot) => lot.closesAt).length,
        highestPosition: positions.length > 0 ? Math.max(...positions) : undefined,
      },
    };
  }

  return { lots, layout, counts: readListLayout(markdown, lots) };
}

/**
 * Fills in bids and closing times for the list layout.
 *
 * The page carries them as separate sequences, so a bid can only be matched to
 * a lot by position. That is trusted only when the two counts are identical.
 */
function readListLayout(markdown: string, lots: ParsedLot[]): ParsedCatalogue['counts'] {
  const closingByLot = new Map<string, string>();
  for (const match of markdown.matchAll(CLOSING)) {
    const [, lotNumber, dateText, timeText] = match;
    const parsed = parseGraysClose(dateText ?? '', timeText ?? '');
    if (lotNumber && parsed) closingByLot.set(lotNumber, parsed.iso);
  }

  const prices = [...markdown.matchAll(PRICE)].map((m) => Number((m[1] ?? '').replace(/,/g, '')));

  for (const [index, lot] of lots.entries()) {
    const closes = closingByLot.get(lot.lotNumber);
    if (closes) {
      lot.closesAt = closes;
      lot.closesAtSource = 'listed';
    }
    // Only trust position when the counts line up exactly. A mismatch means
    // we cannot say which price belongs to which lot, so we say none of them.
    if (prices.length === lots.length) {
      const price = prices[index];
      if (price !== undefined && Number.isFinite(price)) lot.currentBid = price;
    }
  }

  return { lotBlocks: lots.length, prices: prices.length, closingTimes: closingByLot.size };
}

export class IncompleteExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IncompleteExtractionError';
  }
}

/**
 * Refuses a catalogue that came back incomplete.
 *
 * Silent partial data is worse than none: a 13 lot result from a 90 lot sale
 * looks like a valid small sale, and a user would bid against it. F07 wants
 * every lot, and the metrics target 98 percent completeness.
 *
 * One gap is worth being honest about. A card page states no total, so a page
 * that was cut off after its last complete card reads as a smaller sale and
 * nothing here can tell. Cards lost anywhere else are caught, because the
 * numbering Grays prints would then skip. Open item O17.
 */
export function assertComplete(parsed: ParsedCatalogue): void {
  const { lots, counts } = parsed;

  if (lots.length === 0) {
    throw new IncompleteExtractionError(
      'We could not read any lots from that catalogue page. The page may have changed.',
    );
  }

  // Grays numbers the cards itself, so this is a count we did not derive from
  // our own parsing, and it is the only such count on the page.
  if (counts.highestPosition !== undefined && counts.highestPosition !== lots.length) {
    throw new IncompleteExtractionError(
      `The page numbers its lots up to ${counts.highestPosition} but we read ${lots.length}. The page may have changed.`,
    );
  }

  if (counts.closingTimes > 0 && counts.closingTimes < lots.length) {
    throw new IncompleteExtractionError(
      `We read ${lots.length} lots but only ${counts.closingTimes} closing times. The page may have changed.`,
    );
  }

  if (counts.prices > 0 && counts.prices !== lots.length) {
    throw new IncompleteExtractionError(
      `We read ${lots.length} lots but ${counts.prices} prices. We cannot tell which price belongs to which lot.`,
    );
  }
}
