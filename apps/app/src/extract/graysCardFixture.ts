// A Grays motor vehicle catalogue page, in the shape a real one comes back in.
//
// The structure is copied from a live page fetched on 29 September 2026, the
// one that the first parser read zero lots from. The vehicle names are
// invented, because D44 keeps third party listing content out of this
// repository. The shape is what the parser depends on, not the words.
//
// Every line inside a card ends with two backslashes, which is how Firecrawl
// writes a line break inside a markdown list item. The parser has to cope with
// them, so the fixture has to carry them.

const BREAK = '\\\\';

export type CardLot = {
  /** The number in the lot URL, which is what we key on. */
  number: string;
  /** The number Grays prints on the card, which is not always the same. */
  printed: number;
  title: string;
  price: number;
};

export const CARD_LOTS: CardLot[] = [
  { number: '0001', printed: 1, title: '2015 Invented Wagon Alpha Diesel', price: 1609 },
  { number: '0002', printed: 2, title: '2014 Invented Hatch Beta Petrol', price: 809 },
  // Lot 3 was withdrawn, so the numbers skip. Real sales do this.
  { number: '0004', printed: 4, title: '2006 Invented Cruiser Gamma Diesel', price: 11200 },
  { number: '0037', printed: 37, title: '2016 Invented Sedan Delta Petrol', price: 1909 },
];

/** The countdown every card on the fixture page shows. */
export const CARD_COUNTDOWN = '6h: 51m: 51s';

function card(lot: CardLot, position: number, countdown = CARD_COUNTDOWN) {
  const slug = lot.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const url = `https://www.grays.com/lot/${lot.number}-23502418/motor-vehicles-motor-cycles/${slug}`;
  const image = `https://res2.grays.com/handlers/imagehandler.ashx?t=sh&id=4993${lot.number}&s=flr`;
  const price = lot.price.toLocaleString('en-AU');

  const lines = [
    `Image 1 of 21${BREAK}`,
    `${BREAK}`,
    `1/21${BREAK}`,
    `${BREAK}`,
    `Ends in ${countdown}${BREAK}`,
    `${BREAK}`,
    `Jandakot, WA${BREAK}`,
    `${BREAK}`,
    `No Reserve${BREAK}`,
    `${BREAK}`,
    `**${lot.title}** ${BREAK}`,
    `${BREAK}`,
    `Lot ${lot.printed}Used${BREAK}`,
    `${BREAK}`,
    `![Odometer](https://images.ctfassets.net/x/odometer.svg)Showing 549,752${BREAK}`,
    `${BREAK}`,
    `![Transmission](https://images.ctfassets.net/x/transmission.svg)Sports Automatic${BREAK}`,
    `${BREAK}`,
    `![FuelType](https://images.ctfassets.net/x/fuel_type.svg)Diesel${BREAK}`,
    `${BREAK}`,
    `Current bid:${BREAK}`,
    `${BREAK}`,
    `**$${price}**`,
  ].map((line) => `    ${line}`);

  return [`${String(position).padStart(2, '0')}. [![${lot.title}](${image})${BREAK}`, ...lines]
    .join('\n')
    .concat(`](${url})`);
}

function page(...cards: string[]) {
  return [
    'Invented Perth Motor Vehicle Auction',
    '',
    ...cards,
    '',
    'Invented Perth Motor Vehicle Auction \\| Grays Australia',
  ].join('\n');
}

/** A card page that reads cleanly, with every figure inside its own card. */
export const CARD_PAGE = page(...CARD_LOTS.map((lot, index) => card(lot, index + 1)));

/**
 * A page whose third card never arrived, so Grays' own numbering runs 1, 2, 4.
 * This is what a lost card looks like, and the numbering is what gives it away.
 */
export const CARD_PAGE_MISSING_A_CARD = page(
  card(CARD_LOTS[0]!, 1),
  card(CARD_LOTS[1]!, 2),
  card(CARD_LOTS[3]!, 4),
);

/**
 * A page cut off after its first card, numbering and all.
 *
 * Nothing on a card page states a total, so this reads as a one lot sale and
 * is internally consistent. Open item O17.
 */
export const TRUNCATED_CARD_PAGE = page(card(CARD_LOTS[0]!, 1));

/** A card page where one card lost its countdown. */
export const CARD_PAGE_MISSING_A_CLOSE = page(
  ...CARD_LOTS.map((lot, index) => card(lot, index + 1, index === 1 ? '' : CARD_COUNTDOWN)),
);

/** The labelled facts a card carries, as Firecrawl writes them. */
export const CARD_ATTRIBUTES = [
  `![Odometer](https://images.ctfassets.net/x/odometer.svg)Showing 549,752${BREAK}`,
  `${BREAK}`,
  `![Transmission](https://images.ctfassets.net/x/transmission.svg)Sports Automatic${BREAK}`,
  `${BREAK}`,
  `![FuelType](https://images.ctfassets.net/x/fuel_type.svg)Diesel${BREAK}`,
].join('\n');
