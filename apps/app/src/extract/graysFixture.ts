// A Grays catalogue page in the shape a real one comes back in.
//
// The structure is copied from a live page fetched on 23 September 2026. The
// product names are invented, because D44 keeps third party listing content
// out of this repository. The shape is what the parser depends on, not the
// words.

function lotBlock(number: string, title: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `[![${title}](https://res0.grays.com/handlers/imagehandler.ashx?t=sh&id=${number}&s=ont&index=0)](https://www.grays.com/lot/${number}-23502297/computers-and-it-equipment/p-${slug}-p)`;
}

function closingBlock(number: string) {
  return [
    `**Lot No:** ${number}-23502297`,
    '',
    '**Closes:** 25 Sep 26 [9.00 PM AEST](https://www.grays.com/changetimezone.aspx?ReturnUrl=%2fsale%2f23502297 "(UTC+10:00) Canberra, Melbourne, Sydney")',
    '',
    '**Part of Sale:** [Invented Mixed IT Equipment - #623](https://www.grays.com/sale/23502297/computers-it-equipment/invented-mixed-it-equipment-623)',
  ].join('\n');
}

export const LOTS = [
  { number: '0001', title: 'DESKTOP TOWER ALPHA 100', price: 150 },
  { number: '0002', title: 'DESKTOP TOWER ALPHA 200', price: 79 },
  { number: '0003', title: 'ALL IN ONE BETA 24 INCH', price: 29 },
  { number: '0004', title: 'MOBILE WORKSTATION GAMMA 15', price: 360 },
];

/** A page that parses cleanly, with everything lining up. */
export const COMPLETE_PAGE = [
  '# Invented Mixed IT Equipment - #623',
  '',
  ...LOTS.map((lot) => lotBlock(lot.number, lot.title)),
  '',
  ...LOTS.map((lot) => `$${lot.price}`),
  '',
  ...LOTS.map((lot) => closingBlock(lot.number)),
].join('\n\n');

/** The failure Firecrawl produced: most of the lots simply missing. */
export const TRUNCATED_PAGE = [
  '# Invented Mixed IT Equipment - #623',
  '',
  lotBlock(LOTS[0]!.number, LOTS[0]!.title),
  '',
  ...LOTS.map((lot) => `$${lot.price}`),
  '',
  ...LOTS.map((lot) => closingBlock(lot.number)),
].join('\n\n');

/** A page where the prices do not line up with the lots. */
export const MISMATCHED_PRICES = [
  '# Invented Mixed IT Equipment - #623',
  '',
  ...LOTS.map((lot) => lotBlock(lot.number, lot.title)),
  '',
  '$150',
  '$79',
  '',
  ...LOTS.map((lot) => closingBlock(lot.number)),
].join('\n\n');
