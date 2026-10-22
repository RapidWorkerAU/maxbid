// How current the figures on screen are, and how we say so.
//
// Split from lots.test.ts, which outgrew the file size limit. Everything
// here is about the bid freshness sentence; everything there is about the
// rows themselves.

import { describe, expect, it } from 'vitest';
import { bidFreshnessNote, bidsCheckedNoteFor } from './lots';

describe('saying when we last checked the bids', () => {
  const now = new Date('2026-10-22T12:00:00.000Z');
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

  it('says nothing when we have never checked', () => {
    // A sentence about a check that never happened is worse than no sentence.
    expect(bidsCheckedNoteFor([], now)).toBeUndefined();
    expect(bidsCheckedNoteFor([null, null], now)).toBeUndefined();
  });

  it('says just now for a check inside the minute', () => {
    expect(bidsCheckedNoteFor([ago(0)], now)).toBe('We checked the current bids just now.');
  });

  it('counts in minutes under the hour', () => {
    expect(bidsCheckedNoteFor([ago(14)], now)).toContain('14 minutes ago');
  });

  it('uses the singular for one', () => {
    expect(bidsCheckedNoteFor([ago(1)], now)).toContain('1 minute ago');
    expect(bidsCheckedNoteFor([ago(60)], now)).toContain('1 hour ago');
  });

  it('counts in hours under the day', () => {
    expect(bidsCheckedNoteFor([ago(60 * 7)], now)).toContain('7 hours ago');
  });

  it('counts in days beyond that, and says the figures may be well out of date', () => {
    const note = bidsCheckedNoteFor([ago(60 * 24 * 3)], now)!;
    expect(note).toContain('3 days ago');
    expect(note).toContain('well out of date');
  });

  it('quotes the oldest check, not the newest', () => {
    // A list is only as current as its stalest row. Quoting the newest would
    // describe the best case as the whole picture.
    expect(bidsCheckedNoteFor([ago(2), ago(400)], now)).toContain('7 hours ago');
  });

  it('ignores a lot we have never checked rather than treating it as ancient', () => {
    expect(bidsCheckedNoteFor([null, ago(14)], now)).toContain('14 minutes ago');
  });

  it('tells the reader to check the site before bidding', () => {
    // We are stating a fact about a figure we read, not telling anybody what
    // to bid. The auction site is the only live answer.
    expect(bidsCheckedNoteFor([ago(30)], now)).toContain('auction site');
  });

  it('contains no dashes, as the writing rules require', () => {
    for (const minutes of [0, 5, 90, 60 * 24 * 2]) {
      expect(bidsCheckedNoteFor([ago(minutes)], now)).not.toMatch(/[-–—]/);
    }
  });
});

describe('a sale that has already closed', () => {
  const now = new Date('2026-10-22T12:00:00.000Z');
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

  it('says the bids are the last we read rather than dating them', () => {
    // A closed sale's bids cannot move. Warning they may be out of date would
    // mislead the other way: these are what the lots finished on.
    const note = bidsCheckedNoteFor([ago(60 * 24 * 4)], now, true)!;
    expect(note).toContain('This sale has closed');
    expect(note).not.toContain('out of date');
  });

  it('still says nothing when we never read a bid', () => {
    expect(bidsCheckedNoteFor([null], now, true)).toBeUndefined();
  });

  it('dates the bids while the sale is still running', () => {
    expect(bidsCheckedNoteFor([ago(30)], now, false)).toContain('30 minutes ago');
  });
});

describe('the freshness sentence the screen actually uses', () => {
  const now = new Date('2026-10-22T12:00:00.000Z');
  const at = (hours: number) => new Date(now.getTime() + hours * 3_600_000).toISOString();
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

  it('treats the sale as closed only when every lot has closed', () => {
    // One lot still running means the sale is still running, and the bids on
    // every lot in it can still move.
    const mixed = [
      { closes_at: at(-1), bid_checked_at: ago(20) },
      { closes_at: at(3), bid_checked_at: ago(20) },
    ];
    expect(bidFreshnessNote(mixed, now)).toContain('20 minutes ago');

    const allClosed = [
      { closes_at: at(-1), bid_checked_at: ago(20) },
      { closes_at: at(-2), bid_checked_at: ago(20) },
    ];
    expect(bidFreshnessNote(allClosed, now)).toContain('This sale has closed');
  });

  it('treats an unknown closing time as still running', () => {
    // We cannot say a sale has ended on the strength of not knowing when it
    // ends, and claiming these were the final bids would be a guess.
    const unknown = [{ closes_at: null, bid_checked_at: ago(20) }];
    expect(bidFreshnessNote(unknown, now)).toContain('20 minutes ago');
  });

  it('says nothing for a catalogue with no lots', () => {
    expect(bidFreshnessNote([], now)).toBeUndefined();
  });
});
