import { describe, expect, it } from 'vitest';
import { LOTS_TO_VALUE, lotsWorthValuing, shortlistNote } from './shortlist';

const lot = (lotId: string, currentBid: number | null, unidentified = false) => ({
  lotId,
  currentBid,
  unidentified,
});

describe('choosing which lots to value', () => {
  it('takes the dearest first', () => {
    // The current bid is worthless as headroom and useful as a rough measure
    // of what kind of thing a lot is. The RAM bid to $22,100 was always a
    // bigger lot than the Fiat bid to $409, and both trebled.
    const chosen = lotsWorthValuing(
      [lot('fiat', 409), lot('ram', 22100), lot('audi', 9000)],
      2,
    );
    expect(chosen.map((l) => l.lotId)).toEqual(['ram', 'audi']);
  });

  it('treats a lot with no bid as the cheapest', () => {
    const chosen = lotsWorthValuing([lot('none', null), lot('bid', 100)], 1);
    expect(chosen[0]?.lotId).toBe('bid');
  });

  it('leaves out a lot triage could not identify', () => {
    // Nothing can be searched for, so a fetch spent on it buys nothing.
    const chosen = lotsWorthValuing([lot('unknown', 50000, true), lot('known', 100)]);
    expect(chosen.map((l) => l.lotId)).toEqual(['known']);
  });

  it('takes everything when the catalogue is small enough', () => {
    const lots = [lot('a', 1), lot('b', 2), lot('c', 3)];
    expect(lotsWorthValuing(lots)).toHaveLength(3);
  });

  it('stops at the limit on a big catalogue', () => {
    // 300 lots at eight fetches a minute is six hours. Thirty brings it
    // inside an hour, and nobody analyses three hundred lots anyway.
    const lots = Array.from({ length: 300 }, (_, i) => lot(String(i), i));
    expect(lotsWorthValuing(lots)).toHaveLength(LOTS_TO_VALUE);
  });

  it('picks the same lots twice running', () => {
    const lots = [lot('b', 100), lot('a', 100), lot('c', 100)];
    expect(lotsWorthValuing(lots, 2).map((l) => l.lotId)).toEqual(['a', 'b']);
  });

  it('copes with a catalogue of nothing', () => {
    expect(lotsWorthValuing([])).toEqual([]);
  });
});

describe('telling the user what was left out', () => {
  it('says how many were valued and how many were not', () => {
    const said = shortlistNote(300, 30)!;
    expect(said).toContain('30 most likely to be worth your time');
    expect(said).toContain('other 270');
  });

  it('says nothing when every lot was valued', () => {
    // On a small catalogue there is nothing to explain.
    expect(shortlistNote(20, 20)).toBeNull();
  });

  it('offers a valuation on the rest rather than dismissing them', () => {
    // A lot left out is not a lot we decided was worthless.
    expect(shortlistNote(300, 30)).toMatch(/Ask for one on any of them/);
  });

  it('writes plainly, with no dashes', () => {
    expect(shortlistNote(300, 30)).not.toMatch(/[-–—]/);
  });
});
