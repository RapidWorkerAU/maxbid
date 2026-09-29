// A Grays lot page's premium table, in the shape a real one comes back in.
//
// Copied from the lot pages fetched on 29 September 2026. The figures are the
// auction's own published terms rather than listing content, so they are
// reproduced as they stand. D44 keeps product names out, and there are none.

/** The Overview table as Firecrawl writes it. */
export const PREMIUM_TABLE = [
  '| Buyers premium | | Final Bid Price | Buyers Premium |',
  '| --- | --- |',
  '| $0 - $2,000 | $495 |',
  '| $2,001 - $5,000 | $650 |',
  '| $5,001 - $10,000 | $710 |',
  '| $10,001 - $30,000 | 7% |',
  '| $30,001 - $40,000 | 6% |',
  '| $40,001+ | 5% |',
].join('\n');

/** The note that decides whether GST is already inside those figures. */
export const GST_NOTE =
  '**GST Note:** GST will not be added to, or included in, the final bid price of this item. GST is included in the buyers premium.';

/**
 * The vendor written premium further down the page, which says something else.
 * D131 settles that the Overview table governs and this is kept as raw terms.
 */
export const DESCRIPTION_PREMIUM =
  "Buyer's Premium Standard Car:$0 - $5,000 = $550 (inc GST)$5,001 - $65,000 = $715 (inc GST) + 1.65% (inc GST)Above $65,001 = 2.75% (inc GST)";

/** A lot page as it really arrives: the table twice, the note, the description. */
export const LOT_PAGE = [
  '### Overview',
  '',
  PREMIUM_TABLE,
  '',
  GST_NOTE,
  '',
  '### Description',
  '',
  DESCRIPTION_PREMIUM,
  '',
  '### Buyers premium',
  '',
  PREMIUM_TABLE,
].join('\n');

/** The labelled row a lot page carries naming the sale it belongs to. */
export const PART_OF_SALE_ROW =
  '| Part of Sale | [Invented Perth Motor Vehicle Auction](https://www.grays.com/sale/23502418/motor-vehicles-motor-cycles/invented-perth-motor-vehicle-auction) |';
