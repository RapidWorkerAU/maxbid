// Reads a Grays catalogue page.
//
// Firecrawl's own AI extraction was tried first and returned 13 lots from a
// page holding 90, silently. F07 wants every lot with correct lot numbers and
// the metrics target 98 percent completeness, so the markdown is parsed here
// instead. The markdown is labelled text rather than CSS selectors, which
// makes it steadier than it sounds.
//
// The page holds three parallel sequences, each 90 long on the page this was
// written against:
//
//   [![TITLE](image)](https://www.grays.com/lot/0001-23502297/...)
//   $150
//   **Lot No:** 0001-23502297
//   **Closes:** 25 Sep 26 [9.00 PM AEST](...)
//
// Lot number, title, image and URL come from the first. Closing times key off
// the lot number. Current bids have no lot number beside them, so they join by
// position, which is the fragile part and exactly what the completeness check
// exists to catch.

import { parseGraysClose } from './graysDates';

export type ParsedLot = {
  lotNumber: string;
  title: string;
  lotUrl: string;
  imageUrl?: string;
  currentBid?: number;
  closesAt?: string;
};

export type ParsedCatalogue = {
  lots: ParsedLot[];
  /** What the page said it held, so the caller can check nothing was lost. */
  counts: {
    lotBlocks: number;
    prices: number;
    closingTimes: number;
  };
};

const LOT_BLOCK = /\[!\[([^\]]*)\]\(([^)]*)\)\]\((https:\/\/www\.grays\.com\/lot\/([\w-]+)\/[^)]*)\)/g;
const PRICE = /\$([\d,]+(?:\.\d{2})?)/g;
const CLOSING = /\*\*Lot No:\*\*\s*([\w-]+)\s*\n+\s*\*\*Closes:\*\*\s*([^[\n]+)\[([^\]]+)\]/g;

export function parseGraysCatalogue(markdown: string): ParsedCatalogue {
  const lots: ParsedLot[] = [];
  const seen = new Set<string>();

  for (const match of markdown.matchAll(LOT_BLOCK)) {
    const [, title, imageUrl, lotUrl, lotNumber] = match;
    if (!lotNumber || seen.has(lotNumber)) continue;
    seen.add(lotNumber);
    lots.push({
      lotNumber,
      title: (title ?? '').trim(),
      lotUrl: lotUrl ?? '',
      imageUrl: imageUrl || undefined,
    });
  }

  const closingByLot = new Map<string, string>();
  for (const match of markdown.matchAll(CLOSING)) {
    const [, lotNumber, dateText, timeText] = match;
    const parsed = parseGraysClose(dateText ?? '', timeText ?? '');
    if (lotNumber && parsed) closingByLot.set(lotNumber, parsed.iso);
  }

  const prices = [...markdown.matchAll(PRICE)].map((m) => Number((m[1] ?? '').replace(/,/g, '')));

  for (const [index, lot] of lots.entries()) {
    lot.closesAt = closingByLot.get(lot.lotNumber);
    // Only trust position when the counts line up exactly. A mismatch means
    // we cannot say which price belongs to which lot, so we say none of them.
    if (prices.length === lots.length) {
      const price = prices[index];
      if (price !== undefined && Number.isFinite(price)) lot.currentBid = price;
    }
  }

  return {
    lots,
    counts: {
      lotBlocks: lots.length,
      prices: prices.length,
      closingTimes: closingByLot.size,
    },
  };
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
 */
export function assertComplete(parsed: ParsedCatalogue): void {
  const { lots, counts } = parsed;

  if (lots.length === 0) {
    throw new IncompleteExtractionError(
      'We could not read any lots from that catalogue page. The page may have changed.',
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
