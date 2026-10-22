// What the dashboard says. SC02.

import { describe, expect, it } from 'vitest';
import { agoInWords, cardNote, creditNote, type AnalysisCard } from './dashboard';

const NOW = new Date('2026-10-22T12:00:00.000Z');
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000).toISOString();

function card(over: Partial<AnalysisCard> = {}): AnalysisCard {
  return {
    id: 'a1',
    title: 'Motor vehicles, Perth',
    status: 'triaged',
    lots: 13,
    withFigures: 2,
    createdAt: ago(30),
    ...over,
  };
}

describe('what a card says it is doing', () => {
  it('says the stage while it is still running', () => {
    // The useful thing about an analysis you are waiting for is where it has
    // got to.
    expect(cardNote(card({ status: 'valuing' }))).toContain('worth');
  });

  it('says what it found once it has finished', () => {
    expect(cardNote(card())).toBe('We read 13 lots and worked out a bid figure for 2 of them.');
  });

  it('does not call an empty list ready', () => {
    // The same error the triage status made before it had its own valuing
    // stage: saying a thing is ready when it has nothing to show.
    const note = cardNote(card({ withFigures: 0 }));
    expect(note).toContain('could not find enough evidence');
    expect(note).not.toContain('worked out a bid figure');
  });

  it('says plainly when no lots were read at all', () => {
    expect(cardNote(card({ lots: 0, withFigures: 0 }))).toBe(
      'We could not read any lots from this catalogue.',
    );
  });

  it('uses the singular for one lot', () => {
    expect(cardNote(card({ lots: 1, withFigures: 1 }))).toContain('We read 1 lot and');
  });

  it('uses no dashes, as the writing rules require', () => {
    for (const status of ['queued', 'extracting', 'triaging', 'valuing', 'triaged']) {
      expect(cardNote(card({ status }))).not.toMatch(/[–—]/);
    }
  });
});

describe('saying how long ago', () => {
  it('counts in minutes, hours, days and months', () => {
    expect(agoInWords(ago(0), NOW)).toBe('Just now');
    expect(agoInWords(ago(30), NOW)).toBe('30 minutes ago');
    expect(agoInWords(ago(60 * 5), NOW)).toBe('5 hours ago');
    expect(agoInWords(ago(60 * 24 * 3), NOW)).toBe('3 days ago');
    expect(agoInWords(ago(60 * 24 * 60), NOW)).toBe('2 months ago');
  });

  it('uses the singular for one', () => {
    expect(agoInWords(ago(1), NOW)).toBe('1 minute ago');
    expect(agoInWords(ago(60), NOW)).toBe('1 hour ago');
  });

  it('says it cannot date something rather than inventing a time', () => {
    expect(agoInWords('whenever', NOW)).toBe('At an unknown time');
  });
});

describe('the credit balance', () => {
  it('says what a credit buys, every time', () => {
    // A balance in a unit the reader has to remember is one they have to
    // translate.
    expect(creditNote(10)).toBe(
      'You have 10 credits, which pays for 10 lots to be analysed in full.',
    );
  });

  it('uses the singular for one credit', () => {
    expect(creditNote(1)).toBe('You have 1 credit, which pays for 1 lot to be analysed in full.');
  });

  it('says plainly when there are none', () => {
    expect(creditNote(0)).toContain('You have no credits left');
    expect(creditNote(-5)).toContain('You have no credits left');
  });

  it('never says to buy more, which is a sales line rather than a fact', () => {
    for (const balance of [0, 1, 50]) {
      expect(creditNote(balance).toLowerCase()).not.toContain('buy');
      expect(creditNote(balance).toLowerCase()).not.toContain('upgrade');
    }
  });
});
