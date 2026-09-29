import { describe, expect, it } from 'vitest';
import { readSetup } from './setupValues';

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.append(key, value);
  return data;
}

const inDollars = { profitMode: 'dollars', target: '4000', minimum: '1500', gstRegistered: 'yes' };
const asReturn = { profitMode: 'percent', target: '30', minimum: '15', gstRegistered: 'no' };

describe('a target set in dollars', () => {
  it('reads both figures', () => {
    expect(readSetup(form(inDollars))).toEqual({
      gstRegistered: true,
      profitMode: 'dollars',
      targetAmount: 4000,
      minimumAmount: 1500,
      targetPct: null,
      minimumPct: null,
    });
  });

  it('reads the GST answer', () => {
    expect(readSetup(form({ ...inDollars, gstRegistered: 'no' }))).toMatchObject({
      gstRegistered: false,
    });
  });

  it('accepts a target of nothing, because breaking even is a decision', () => {
    expect(readSetup(form({ ...inDollars, target: '0', minimum: '0' }))).toMatchObject({
      targetAmount: 0,
    });
  });
});

describe('a target set as a return on cost', () => {
  it('turns the percentage into a fraction', () => {
    // The form asks for a percentage because that is how people say it. The
    // calculator works in fractions, and converting here means the unit is
    // never anybody's guess later.
    expect(readSetup(form(asReturn))).toMatchObject({
      targetPct: 0.3,
      minimumPct: 0.15,
      targetAmount: null,
    });
  });
});

describe('what it refuses, and what it says', () => {
  it('asks which kind of target before asking for a figure', () => {
    expect(readSetup(form({ target: '4000', minimum: '1500' }))).toEqual({
      error: 'Choose whether you set your profit target in dollars or as a return on cost.',
    });
  });

  it('names the field and says what it is for', () => {
    // CP11. An error says what happened and what the user can do.
    expect(readSetup(form({ ...inDollars, target: '' }))).toEqual({
      error: 'Enter the profit you are aiming for. It sets your target bid.',
    });
    expect(readSetup(form({ ...inDollars, minimum: '' }))).toMatchObject({
      error: expect.stringContaining('sets your limit bid'),
    });
  });

  it('refuses a profit below nothing', () => {
    expect(readSetup(form({ ...inDollars, target: '-100' }))).toMatchObject({
      error: expect.stringContaining('cannot be less than nothing'),
    });
  });

  it('refuses a minimum above the target, rather than swapping them', () => {
    // The two figures mean different things, and the wrong way round would
    // put the limit bid below the target bid, which is never right.
    expect(readSetup(form({ ...inDollars, target: '1500', minimum: '4000' }))).toMatchObject({
      error: expect.stringContaining('higher than the profit you are aiming for'),
    });
  });

  it('refuses a figure that is not a number', () => {
    expect(readSetup(form({ ...inDollars, target: 'a lot' }))).toMatchObject({
      error: expect.stringContaining('Enter the profit'),
    });
  });

  it('writes plainly, with no dashes', () => {
    const result = readSetup(form({ ...inDollars, target: '1500', minimum: '4000' }));
    expect('error' in result && result.error).not.toMatch(/[-–—]/);
  });
});

describe('the gap an existing organisation falls into', () => {
  it('reads the same values whether a profile exists or not', () => {
    // The action creates a profile where none exists. An organisation made
    // before decision record 0022 has none, and an update matching no rows
    // reports success, which would tell somebody their figures were saved
    // when they were not. This file only reads the form, so the guard lives
    // in setup.ts, and this test is here to point at it.
    expect(readSetup(form(inDollars))).toMatchObject({ targetAmount: 4000 });
  });
});
