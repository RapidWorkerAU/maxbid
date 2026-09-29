import { describe, expect, it } from 'vitest';
import {
  canShowBidFigures,
  missingForBidFigures,
  whatIsMissing,
  type CostProfileSettings,
} from './costProfile';

/** What a new organisation gets: something to edit and nothing to unlearn. */
const empty: CostProfileSettings = {
  profit_mode: null,
  target_profit_amount: null,
  target_return_pct: null,
  min_profit_amount: null,
  min_return_pct: null,
  completed_at: null,
};

const inDollars: CostProfileSettings = {
  ...empty,
  profit_mode: 'dollars',
  target_profit_amount: '4000.00',
  min_profit_amount: '1500.00',
  completed_at: '2026-09-29T00:00:00.000Z',
};

const asReturn: CostProfileSettings = {
  ...empty,
  profit_mode: 'percent',
  target_return_pct: '0.3000',
  min_return_pct: '0.1500',
  completed_at: '2026-09-29T00:00:00.000Z',
};

describe('a profile nobody has filled in', () => {
  it('cannot produce a bid figure', () => {
    // Decision record 0022. A default profit target is a guess about somebody
    // else's business, so a new organisation starts with nothing.
    expect(canShowBidFigures(empty)).toBe(false);
  });

  it('asks first whether the user thinks in dollars or in a return', () => {
    // No point asking for a figure before knowing what kind of figure it is.
    expect(missingForBidFigures(empty)).toEqual([
      {
        field: 'profit_mode',
        label: 'Whether you set your profit target in dollars or as a return on cost',
      },
    ]);
  });

  it('says what is missing rather than that it is incomplete', () => {
    // "Incomplete" sends somebody looking for what. The answer is right here.
    expect(whatIsMissing(empty)).toMatch(/dollars or as a return on cost/);
    expect(whatIsMissing(empty)).not.toMatch(/incomplete/i);
  });
});

describe('a profile with no profile at all', () => {
  it('asks for one', () => {
    expect(canShowBidFigures(null)).toBe(false);
    expect(missingForBidFigures(null)[0]?.field).toBe('profile');
  });
});

describe('targets set in dollars', () => {
  it('is usable once both figures are set', () => {
    expect(canShowBidFigures(inDollars)).toBe(true);
    expect(whatIsMissing(inDollars)).toBeNull();
  });

  it('still needs the minimum, which sets the limit bid', () => {
    const half = { ...inDollars, min_profit_amount: null };
    expect(canShowBidFigures(half)).toBe(false);
    expect(whatIsMissing(half)).toMatch(/least profit you would accept/);
  });

  it('accepts a target of nothing, because zero is a decision', () => {
    // Somebody buying to break even has chosen that. Unset has not.
    expect(canShowBidFigures({ ...inDollars, target_profit_amount: 0 })).toBe(true);
  });

  it('ignores the return figures, which do not apply', () => {
    expect(canShowBidFigures({ ...inDollars, target_return_pct: null })).toBe(true);
  });
});

describe('targets set as a return on cost', () => {
  it('is usable once both figures are set', () => {
    expect(canShowBidFigures(asReturn)).toBe(true);
  });

  it('needs the minimum return as well', () => {
    expect(canShowBidFigures({ ...asReturn, min_return_pct: null })).toBe(false);
  });

  it('ignores the dollar figures, which do not apply', () => {
    expect(canShowBidFigures({ ...asReturn, target_profit_amount: null })).toBe(true);
  });
});

describe('listing several missing settings', () => {
  it('names them all in one sentence', () => {
    const noFigures = { ...inDollars, target_profit_amount: null, min_profit_amount: null };
    const said = whatIsMissing(noFigures)!;
    expect(said).toMatch(/the profit you are aiming for/);
    expect(said).toMatch(/and the least profit you would accept/);
  });

  it('writes a plain sentence, with no dashes', () => {
    // The writing rules apply to anything a user reads.
    const said = whatIsMissing(empty)!;
    expect(said).not.toMatch(/[-–—]/);
    expect(said.endsWith('.')).toBe(true);
  });
});
