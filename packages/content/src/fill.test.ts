import { describe, expect, it } from 'vitest';
import { DS16, DS17, exclusionNote, fill } from './index';

describe('filling a standard message', () => {
  it('fills the gaps in order', () => {
    expect(fill(DS17, [2, '$14,000', '$17,500'])).toBe(
      'You excluded 2 comparables. The expected resale changed from $14,000 to $17,500.',
    );
  });

  it('tells two gaps of the same name apart by where they are', () => {
    // DS17 has two amounts meaning different things, so a name could not
    // tell them apart.
    const filled = fill(DS17, [1, '$9,000', '$11,000']);
    expect(filled.indexOf('$9,000')).toBeLessThan(filled.indexOf('$11,000'));
  });

  it('fills a message with gaps of different names', () => {
    expect(fill(DS16, ['22 October 2026', 'triage-valuation-4'])).toContain(
      'generated on 22 October 2026 using method version triage-valuation-4',
    );
  });

  it('leaves a message with no gaps alone', () => {
    expect(fill('Nothing to fill here.', [])).toBe('Nothing to fill here.');
  });
});

describe('when the figures do not match the gaps', () => {
  it('refuses too few, rather than showing a gap to a user', () => {
    // A disclaimer showing "[amount]" is a figure we promised and did not
    // give, in the one kind of text that exists to be precise.
    expect(() => fill(DS17, [2])).toThrow(/3 gaps and 1 were given/);
  });

  it('refuses too many, because one of them was meant to go somewhere', () => {
    expect(() => fill(DS17, [2, 'a', 'b', 'c'])).toThrow();
  });

  it('says how many it wanted, so the caller can fix it', () => {
    expect(() => fill('One [gap] here.', [])).toThrow(/1 gap and 0 were given/);
  });
});

describe('what the exclusions did to the figures', () => {
  it('counts in the plural for several', () => {
    expect(exclusionNote(3, '$17,500', '$14,000')).toBe(
      'You excluded 3 comparables. The expected resale changed from $17,500 to $14,000.',
    );
  });

  it('counts in the singular for one', () => {
    // "You excluded 1 comparables" is the kind of sentence that makes a
    // reader wonder what else we were careless about.
    expect(exclusionNote(1, '$17,500', '$16,200')).toBe(
      'You excluded 1 comparable. The expected resale changed from $17,500 to $16,200.',
    );
  });

  it('keeps the two amounts in the order they were given', () => {
    const said = exclusionNote(2, '$20,000', '$12,000');
    expect(said.indexOf('$20,000')).toBeLessThan(said.indexOf('$12,000'));
  });

  it('uses no dashes, as the writing rules require', () => {
    expect(exclusionNote(2, '$20,000', '$12,000')).not.toMatch(/[-–—]/);
  });
});
