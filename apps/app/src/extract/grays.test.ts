import { describe, expect, it } from 'vitest';
import {
  IncompleteExtractionError,
  assertComplete,
  parseGraysCatalogue,
} from './grays';
import { COMPLETE_PAGE, LOTS, MISMATCHED_PRICES, TRUNCATED_PAGE } from './graysFixture';

describe('reading a catalogue page', () => {
  const parsed = parseGraysCatalogue(COMPLETE_PAGE);

  it('finds every lot on the page', () => {
    expect(parsed.lots).toHaveLength(LOTS.length);
  });

  it('reads the lot number, title and link', () => {
    const first = parsed.lots[0]!;
    expect(first.lotNumber).toBe('0001-23502297');
    expect(first.title).toBe('DESKTOP TOWER ALPHA 100');
    expect(first.lotUrl).toContain('https://www.grays.com/lot/0001-23502297/');
  });

  it('keeps the image for the vision stage', () => {
    expect(parsed.lots[0]!.imageUrl).toContain('imagehandler.ashx');
  });

  it('matches each price to its lot', () => {
    for (const [index, lot] of parsed.lots.entries()) {
      expect(lot.currentBid).toBe(LOTS[index]!.price);
    }
  });

  it('turns the closing time into an instant, not a local string', () => {
    // 25 Sep 26 at 9pm AEST is 11am UTC the same day.
    expect(parsed.lots[0]!.closesAt).toBe('2026-09-25T11:00:00.000Z');
  });

  it('never returns the same lot twice', () => {
    const numbers = parsed.lots.map((lot) => lot.lotNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});

describe('the completeness check', () => {
  it('passes a page that read cleanly', () => {
    expect(() => assertComplete(parseGraysCatalogue(COMPLETE_PAGE))).not.toThrow();
  });

  it('refuses a page that lost most of its lots', () => {
    // This is the failure Firecrawl produced: 13 lots from a page of 90,
    // silently. A short result must not look like a small sale.
    const parsed = parseGraysCatalogue(TRUNCATED_PAGE);
    expect(parsed.lots).toHaveLength(1);
    expect(() => assertComplete(parsed)).toThrow(IncompleteExtractionError);
  });

  it('refuses a page where the prices do not line up', () => {
    const parsed = parseGraysCatalogue(MISMATCHED_PRICES);
    expect(() => assertComplete(parsed)).toThrow(/which price belongs to which lot/);
  });

  it('refuses a page with no lots at all', () => {
    expect(() => assertComplete(parseGraysCatalogue('# Nothing here'))).toThrow(
      /could not read any lots/,
    );
  });

  it('leaves every bid unset rather than guessing when the counts disagree', () => {
    const parsed = parseGraysCatalogue(MISMATCHED_PRICES);
    expect(parsed.lots.every((lot) => lot.currentBid === undefined)).toBe(true);
  });
});
