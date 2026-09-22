import { describe, expect, it } from 'vitest';
import { bidLimits } from './bidLimits';
import { MIN_PROFIT, TARGET_PROFIT, registered, unregistered } from './examples';
import { displayBidLimits, roundDownToDollar, roundToDollar } from './rounding';

describe('displayBidLimits, worked example 1', () => {
  const shown = displayBidLimits(bidLimits(registered, TARGET_PROFIT, MIN_PROFIT));

  it('shows the three figures rounded down', () => {
    expect(shown).toEqual({ targetBid: 7936, limitBid: 10081, breakEvenBid: 11369 });
  });

  it('shows the limit bid as 10081, not 10082', () => {
    // The unrounded figure is 10081.94. Rounding to the nearest dollar would
    // advise a bid above the limit, so it rounds down.
    expect(shown.limitBid).toBe(10081);
  });
});

describe('displayBidLimits, worked example 3', () => {
  it('shows the three figures rounded down', () => {
    const shown = displayBidLimits(bidLimits(unregistered, TARGET_PROFIT, MIN_PROFIT));
    expect(shown).toEqual({ targetBid: 8248, limitBid: 10198, breakEvenBid: 11369 });
  });
});

describe('roundDownToDollar', () => {
  it('never rounds a figure up', () => {
    expect(roundDownToDollar(7936.99)).toBe(7936);
    expect(roundDownToDollar(10081.94)).toBe(10081);
    expect(roundDownToDollar(11369.49)).toBe(11369);
  });

  it('leaves a whole dollar figure alone', () => {
    expect(roundDownToDollar(8000)).toBe(8000);
    expect(roundDownToDollar(0)).toBe(0);
  });

  it('does not lose a dollar to floating point noise', () => {
    // A figure that is truly 7936.00 can arrive from division looking like
    // this. Flooring it directly would hand back 7935.
    expect(roundDownToDollar(7935.9999999999)).toBe(7936);
    expect(roundDownToDollar(0.1 + 0.2 + 7935.7)).toBe(7936);
  });

  it('still rounds down a figure that is genuinely below the dollar', () => {
    expect(roundDownToDollar(7935.99)).toBe(7935);
  });
});

describe('roundToDollar', () => {
  it('rounds other money figures to the nearest dollar', () => {
    expect(roundToDollar(14100.0)).toBe(14100);
    expect(roundToDollar(1281.82)).toBe(1282);
    expect(roundToDollar(12818.18)).toBe(12818);
  });
});
