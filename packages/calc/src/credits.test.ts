// What a shortlist costs. F17.
//
// Pure because it decides what somebody is charged, and because the preview
// they read before confirming and the reserve the pipeline takes afterwards
// have to be the same number.

import { describe, expect, it } from 'vitest';
import { CREDITS_PER_LOT, lotsAffordable, shortlistCost } from './credits';

describe('what a shortlist costs', () => {
  it('charges one credit a lot', () => {
    expect(shortlistCost(4, 100).credits).toBe(4 * CREDITS_PER_LOT);
  });

  it('costs nothing when nothing is shortlisted', () => {
    expect(shortlistCost(0, 100)).toMatchObject({ credits: 0, affordable: true, shortfall: 0 });
  });

  it('says what is left afterwards', () => {
    expect(shortlistCost(4, 10).remaining).toBe(6);
  });
});

describe('whether it can be afforded', () => {
  it('allows a shortlist that spends the balance exactly', () => {
    expect(shortlistCost(10, 10)).toMatchObject({ affordable: true, remaining: 0, shortfall: 0 });
  });

  it('refuses one credit more than the balance', () => {
    // F17. The user cannot exceed the credits they have.
    expect(shortlistCost(11, 10)).toMatchObject({ affordable: false, shortfall: 1 });
  });

  it('says how many more are needed, not just that it is too many', () => {
    expect(shortlistCost(30, 10).shortfall).toBe(20);
  });
});

describe('a balance that should not happen', () => {
  it('treats a negative balance as nothing, not as debt', () => {
    // We do not lend credits. A balance below nought is an accident
    // somewhere else, and letting it make a shortlist look affordable would
    // be the wrong way to find out.
    expect(shortlistCost(1, -50)).toMatchObject({
      available: 0,
      affordable: false,
      shortfall: 1,
    });
  });

  it('ignores a fraction of a credit, because a lot is whole', () => {
    expect(shortlistCost(2, 2.9).available).toBe(2);
    expect(shortlistCost(2.9, 10).lots).toBe(2);
  });

  it('treats a negative count of lots as none', () => {
    expect(shortlistCost(-5, 10).credits).toBe(0);
  });
});

describe('how many lots a balance covers', () => {
  it('counts them', () => {
    expect(lotsAffordable(12)).toBe(12);
  });

  it('is nothing on an empty balance', () => {
    expect(lotsAffordable(0)).toBe(0);
    expect(lotsAffordable(-3)).toBe(0);
  });
});
