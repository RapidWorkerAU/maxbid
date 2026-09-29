// Reading a buyer's premium off a Grays lot page. Decision records 0015, 0016.
//
// The premium is not on the catalogue page at all. It is on each lot page, in
// the Overview panel, as a table:
//
//   | Buyers premium | | Final Bid Price | Buyers Premium |
//   | --- | --- |
//   | $0 - $2,000 | $495 |
//   | $2,001 - $5,000 | $650 |
//   | $5,001 - $10,000 | $710 |
//   | $10,001 - $30,000 | 7% |
//   | $30,001 - $40,000 | 6% |
//   | $40,001+ | 5% |
//
// That table is printed twice on the page, once in the Overview and once
// further down, so this reads every copy and refuses the page if they
// disagree. On the two lots checked they were identical.
//
// The same page also carries a second, different premium in its description,
// which is vendor written and repeated word for word across lots. D131 settles
// that the Overview table governs and the description is kept as raw terms, so
// both can be shown to the user when they disagree.
//
// The page also states whether GST is already inside those figures, which
// changes what the buyer pays and what they can claim. D132.

import type { PremiumBand, PremiumSchedule } from '@maxbid/calc';

/** A row of the table: a price range and what it charges. */
const ROW =
  /^\|\s*\$([\d,]+)\s*(?:-\s*\$([\d,]+)|\+)\s*\|\s*(?:\$([\d,]+(?:\.\d+)?)|([\d.]+)\s*%)\s*\|/gm;

/** The note that says the figures already have GST in them. */
const GST_INCLUDED = /GST is included in the buyers? premium/i;

const money = (text: string) => Number(text.replace(/,/g, ''));

export type ParsedPremium = {
  schedule: PremiumSchedule;
  /** The rows exactly as the page wrote them, for the evidence trail. */
  sourceText: string;
};

/** One row of a table, before it is known whether the table reads cleanly. */
type Row = { band: PremiumBand; from: number; line: string };

/** Splits the rows into schedules, each ending at its open ended band. */
function readRows(markdown: string): Row[][] {
  const tables: Row[][] = [];
  let current: Row[] = [];

  for (const match of markdown.matchAll(ROW)) {
    const [line, fromText, toText, fixedText, rateText] = match;
    const upTo = toText ? money(toText) : null;
    const band: PremiumBand | null =
      fixedText !== undefined
        ? { upTo, kind: 'fixed', amount: money(fixedText) }
        : rateText !== undefined
          ? { upTo, kind: 'rate', rate: Number(rateText) / 100 }
          : null;
    if (!band) continue;

    current.push({ band, from: money(fromText ?? '0'), line: (line ?? '').trim() });

    // A row written as "$40,001+" has no upper figure, so it ends the table.
    if (upTo === null) {
      tables.push(current);
      current = [];
    }
  }

  return tables;
}

/**
 * True when a table reads as one unbroken set of ranges.
 *
 * The ranges have to start at zero and run on from one another. A gap means
 * the table was misread, and a lot priced inside that gap would carry a
 * premium belonging to some other price.
 */
function isUnbroken(rows: Row[]): boolean {
  if (rows.length === 0 || rows[0]!.from > 0) return false;
  for (const [index, row] of rows.entries()) {
    if (index === 0) continue;
    const previous = rows[index - 1]!.band.upTo;
    if (previous === null || row.from > previous + 1) return false;
  }
  return true;
}

/**
 * Reads the premium schedule from a lot page.
 *
 * Returns null rather than a guess when the table is not there, does not read
 * cleanly, or appears more than once saying different things. DS12 then tells
 * the user the platform default was used, which is the honest outcome. A
 * premium invented from a half readable table would change every bid figure on
 * the lot without anyone knowing.
 */
export function parseGraysPremium(markdown: string): ParsedPremium | null {
  const tables = readRows(markdown).filter(isUnbroken);
  if (tables.length === 0) return null;

  const bandsOf = (rows: Row[]) => rows.map((row) => row.band);
  const first = bandsOf(tables[0]!);

  // Every copy on the page has to say the same thing. If they disagree we
  // cannot tell which one the auction means, so we read none of them.
  const asText = JSON.stringify(first);
  if (tables.some((rows) => JSON.stringify(bandsOf(rows)) !== asText)) return null;

  return {
    schedule: { bands: first, includesGst: GST_INCLUDED.test(markdown) },
    sourceText: tables[0]!.map((row) => row.line).join('\n'),
  };
}

/** The sale a lot belongs to, as its own page names it. */
const PART_OF_SALE = /^\|\s*Part of Sale\s*\|\s*\[([^\]]+)\]/m;

/**
 * Reads the auction's name from a lot page.
 *
 * The catalogue page carries the name only in its footer, mixed in with the
 * site's own name. A lot page labels it, so there is nothing to guess at.
 */
export function parseGraysSaleTitle(markdown: string): string | null {
  const title = markdown.match(PART_OF_SALE)?.[1]?.trim();
  return title && title.length > 0 ? title : null;
}
