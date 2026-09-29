import { describe, expect, it } from 'vitest';
import { assertComplete, parseGraysCatalogue } from './grays';
import {
  CARD_LOTS,
  CARD_PAGE,
  CARD_PAGE_MISSING_A_CLOSE,
  CARD_PAGE_MISSING_A_CARD,
  TRUNCATED_CARD_PAGE,
} from './graysCardFixture';

// The page was fetched at 04:38:09 UTC, and every card said the sale ends in
// 6h 51m 51s, so every lot closes at 11:30:00 UTC. Those figures are from the
// real page, and both its first and last lot pages confirmed 9.30 PM AEST.
const FETCHED_AT = '2026-09-29T04:38:09.000Z';
const CLOSES_AT = '2026-09-29T11:30:00.000Z';

describe('reading a motor vehicle catalogue, where each lot is a card', () => {
  const parsed = parseGraysCatalogue(CARD_PAGE, FETCHED_AT);

  it('knows it is reading cards, not the older list layout', () => {
    expect(parsed.layout).toBe('card');
  });

  it('finds every lot on the page', () => {
    expect(parsed.lots).toHaveLength(CARD_LOTS.length);
  });

  it('takes the lot number from the link, not from the printed label', () => {
    // The page prints "Lot 4" while the link says 0004-23502418. Only the link
    // is unique across sales, and lot 3 is missing because it was withdrawn.
    expect(parsed.lots.map((lot) => lot.lotNumber)).toEqual([
      '0001-23502418',
      '0002-23502418',
      '0004-23502418',
      '0037-23502418',
    ]);
  });

  it('reads the title, link and image', () => {
    const first = parsed.lots[0]!;
    expect(first.title).toBe(CARD_LOTS[0]!.title);
    expect(first.lotUrl).toContain('https://www.grays.com/lot/0001-23502418/');
    expect(first.imageUrl).toContain('imagehandler.ashx');
  });

  it('takes each bid from inside its own card, so none can be misassigned', () => {
    for (const [index, lot] of parsed.lots.entries()) {
      expect(lot.currentBid).toBe(CARD_LOTS[index]!.price);
    }
  });

  it('reads a bid that carries a thousands separator', () => {
    expect(parsed.lots[2]!.currentBid).toBe(11200);
  });

  it('turns the countdown into a closing time, using when the page was fetched', () => {
    expect(parsed.lots[0]!.closesAt).toBe(CLOSES_AT);
  });

  it('records that the closing time came from a countdown', () => {
    // A countdown is only as exact as the fetch, so a later stage that finds a
    // stated time on the lot page should prefer it.
    expect(parsed.lots[0]!.closesAtSource).toBe('countdown');
  });

  it('reads the location and the no reserve label', () => {
    expect(parsed.lots[0]!.location).toBe('Jandakot, WA');
    expect(parsed.lots[0]!.noReserve).toBe(true);
  });

  it('has no closing time at all when we do not know when the page was fetched', () => {
    // Better nothing than a countdown measured from the wrong moment.
    const guessed = parseGraysCatalogue(CARD_PAGE);
    expect(guessed.lots.every((lot) => lot.closesAt === undefined)).toBe(true);
  });

  it('passes the completeness check', () => {
    expect(() => assertComplete(parsed)).not.toThrow();
  });
});

describe('the completeness check on a card page', () => {
  it('refuses a page that lost a card, because Grays own numbering skips', () => {
    const parsed = parseGraysCatalogue(CARD_PAGE_MISSING_A_CARD, FETCHED_AT);
    expect(parsed.lots).toHaveLength(3);
    expect(parsed.counts.highestPosition).toBe(4);
    expect(() => assertComplete(parsed)).toThrow(/numbers its lots up to 4 but we read 3/);
  });

  it('cannot yet tell that a page was cut off after its last whole card', () => {
    // This is a known gap, recorded as open item O17, and it is written down
    // as a test so it cannot be forgotten. A card page states no total, so one
    // card numbered 1, holding its own bid and closing time, is indistinguishable
    // from a genuine one lot sale.
    const parsed = parseGraysCatalogue(TRUNCATED_CARD_PAGE, FETCHED_AT);
    expect(parsed.lots).toHaveLength(1);
    expect(() => assertComplete(parsed)).not.toThrow();
  });

  it('refuses a page where one card lost its closing time', () => {
    const parsed = parseGraysCatalogue(CARD_PAGE_MISSING_A_CLOSE, FETCHED_AT);
    expect(parsed.counts.closingTimes).toBe(CARD_LOTS.length - 1);
    expect(() => assertComplete(parsed)).toThrow(/closing times/);
  });
});

describe('the labelled facts on a card', () => {
  const parsed = parseGraysCatalogue(CARD_PAGE, FETCHED_AT);

  it('reads the odometer, transmission and fuel', () => {
    expect(parsed.lots[0]!.attributes).toEqual({
      odometer: '549,752',
      transmission: 'Sports Automatic',
      fueltype: 'Diesel',
    });
  });

  it('drops the word Showing from an odometer reading', () => {
    // "Showing 549,752" is how Grays writes it. The number is the fact.
    expect(parsed.lots[0]!.attributes?.odometer).toBe('549,752');
  });

  it('leaves out the picture count, which is not a fact about the lot', () => {
    expect(parsed.lots[0]!.attributes).not.toHaveProperty('image');
  });

  it('reads them for every lot, not only the first', () => {
    // These went missing entirely at first, and the cost only showed up in a
    // valuation: a Landcruiser showing 549,752 kilometres was priced against
    // ordinary ones at $40,000 to $56,000, and the match was called exact.
    expect(parsed.lots.every((lot) => lot.attributes?.odometer)).toBe(true);
  });
});
