import { describe, expect, it } from 'vitest';
import { bidForReturn, bidLimits, bidLimitsForReturn } from './bidLimits';
import { MIN_PROFIT, TARGET_PROFIT, registered, unregistered } from './examples';
import { returnOnCost } from './position';

describe('bidLimits, worked example 1, GST registered', () => {
  const result = bidLimits(registered, TARGET_PROFIT, MIN_PROFIT);

  it('matches the spec to the cent', () => {
    expect(result.targetBid).toBeCloseTo(7936.01, 2);
    expect(result.limitBid).toBeCloseTo(10081.94, 2);
    expect(result.breakEvenBid).toBeCloseTo(11369.49, 2);
  });

  it('works out the basis the spec describes', () => {
    expect(result.netResale).toBeCloseTo(16818.18, 2);
    expect(result.effectiveOtherCosts).toBeCloseTo(3572.73, 2);
    expect(result.costPerHammerDollar).toBeCloseTo(1.165, 10);
  });

  it('puts the three figures in rising order, with the break even bid highest', () => {
    expect(result.targetBid).toBeLessThan(result.limitBid);
    expect(result.limitBid).toBeLessThan(result.breakEvenBid);
  });
});

describe('bidLimits, worked example 3, not GST registered', () => {
  const result = bidLimits(unregistered, TARGET_PROFIT, MIN_PROFIT);

  it('matches the spec to the cent', () => {
    expect(result.targetBid).toBeCloseTo(8248.15, 2);
    expect(result.limitBid).toBeCloseTo(10198.99, 2);
    expect(result.breakEvenBid).toBeCloseTo(11369.49, 2);
  });

  it('carries the GST on the hammer and the premium as a real cost', () => {
    expect(result.netResale).toBe(18500);
    expect(result.effectiveOtherCosts).toBe(3930);
    expect(result.costPerHammerDollar).toBeCloseTo(1.2815, 10);
  });

  it('reaches the same break even bid as the registered buyer', () => {
    const asRegistered = bidLimits(registered, TARGET_PROFIT, MIN_PROFIT);
    expect(result.breakEvenBid).toBeCloseTo(asRegistered.breakEvenBid, 8);
  });
});

describe('profit targets set as a return on cost', () => {
  it('returns exactly the requested return at the bid it gives back', () => {
    for (const inputs of [registered, unregistered]) {
      for (const r of [0, 0.1, 0.25, 0.5]) {
        expect(returnOnCost(inputs, bidForReturn(inputs, r))).toBeCloseTo(r, 10);
      }
    }
  });

  it('gives the break even bid at a return of zero', () => {
    const dollars = bidLimits(registered, TARGET_PROFIT, MIN_PROFIT);
    expect(bidForReturn(registered, 0)).toBeCloseTo(dollars.breakEvenBid, 8);
  });

  it('fills every figure when both targets are returns', () => {
    const result = bidLimitsForReturn(registered, 0.25, 0.1);
    expect(returnOnCost(registered, result.targetBid)).toBeCloseTo(0.25, 10);
    expect(returnOnCost(registered, result.limitBid)).toBeCloseTo(0.1, 10);
    expect(returnOnCost(registered, result.breakEvenBid)).toBeCloseTo(0, 10);
  });
});

describe('guards', () => {
  it('never returns a bid below zero', () => {
    const result = bidLimits({ ...registered, resale: 1000 }, TARGET_PROFIT, MIN_PROFIT);
    expect(result.targetBid).toBe(0);
    expect(result.limitBid).toBe(0);
    expect(bidForReturn({ ...registered, resale: 1000 }, 0.25)).toBe(0);
  });

  it('handles an auction with no buyer premium', () => {
    const result = bidLimits({ ...registered, premiumRate: 0 }, TARGET_PROFIT, MIN_PROFIT);
    expect(result.costPerHammerDollar).toBe(1);
    expect(result.targetBid).toBeCloseTo(16818.18 - 3572.73 - 4000, 1);
  });
});
