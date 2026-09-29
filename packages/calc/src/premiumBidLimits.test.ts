// The bid figures when the premium is a schedule rather than one rate.
// Decision record 0015.

import { describe, expect, it } from 'vitest';
import { costAtHammer } from './basis';
import { bidLimits, highestBidForCost } from './bidLimits';
import { graysVehicleSchedule, registered } from './examples';
import { flatRate } from './premium';
import { displayBidLimits } from './rounding';
import type { BidInputs } from './types';

/** A vehicle from the sale, bought by a GST registered reseller. */
const vehicle: BidInputs = {
  ...registered,
  premium: graysVehicleSchedule,
};

describe('the highest bid within a budget', () => {
  it('never spends more than the budget', () => {
    for (const budget of [500, 1000, 2500, 6000, 11000, 12000, 25000, 60000]) {
      const bid = highestBidForCost({ ...vehicle, otherCosts: 0 }, budget);
      expect(costAtHammer({ ...vehicle, otherCosts: 0 }, bid)).toBeLessThanOrEqual(budget + 1e-6);
    }
  });

  it('finds a bid that nothing higher can beat', () => {
    // Walk a dollar either side of the answer. Nothing above it may fit the
    // budget, which is what makes it the highest.
    const inputs = { ...vehicle, otherCosts: 0 };
    for (const budget of [1000, 2500, 6000, 11000, 12000, 35000]) {
      const bid = highestBidForCost(inputs, budget);
      for (const above of [bid + 0.01, bid + 1, bid + 100]) {
        expect(costAtHammer(inputs, above)).toBeGreaterThan(budget + 1e-6);
      }
    }
  });

  it('steps over the price that costs more than the one above it', () => {
    // A budget of $10,710 buys a $10,000 hammer under the fixed band. It also
    // buys $10,009, because at that price the premium is 7 percent. The
    // higher bid is the right answer and the naive one is not.
    const inputs = { ...vehicle, otherCosts: 0 };
    const bid = highestBidForCost(inputs, 10710);
    expect(bid).toBeGreaterThan(10000);
    expect(bid).toBeCloseTo(10710 / 1.07, 2);
  });

  it('stops at a band edge when the next band costs too much to enter', () => {
    // $2,495 is exactly a $2,000 hammer plus its $495 premium. One dollar more
    // of hammer moves into the $650 band and costs $156 more, which the budget
    // cannot reach, so the answer is the edge itself.
    const inputs = { ...vehicle, otherCosts: 0 };
    expect(highestBidForCost(inputs, 2495)).toBeCloseTo(2000, 6);
  });

  it('gives nothing away when the budget cannot cover the smallest premium', () => {
    const inputs = { ...vehicle, otherCosts: 0 };
    expect(highestBidForCost(inputs, 400)).toBe(0);
  });

  it('agrees with a single rate schedule, which is the old behaviour', () => {
    const inputs = { ...registered, premium: flatRate(0.165), otherCosts: 0 };
    // The plain formula, from before a schedule existed.
    expect(highestBidForCost(inputs, 11650)).toBeCloseTo(11650 / 1.165, 6);
  });
});

describe('the three bid figures on a real vehicle sale', () => {
  const result = bidLimits(vehicle, 4000, 1500);

  it('puts the three figures in rising order', () => {
    expect(result.targetBid).toBeLessThan(result.limitBid);
    expect(result.limitBid).toBeLessThan(result.breakEvenBid);
  });

  it('leaves the promised profit at the target bid', () => {
    const profit = result.netResale - costAtHammer(vehicle, result.targetBid);
    expect(profit).toBeGreaterThanOrEqual(4000 - 1e-6);
  });

  it('leaves nothing at the break even bid', () => {
    const profit = result.netResale - costAtHammer(vehicle, result.breakEvenBid);
    expect(profit).toBeCloseTo(0, 6);
  });

  it('differs from what a single rate would have advised', () => {
    // The whole reason for the schedule. A flat 16.5 percent on this lot
    // advises a materially different bid, and the schedule is the true one.
    const asFlatRate = bidLimits({ ...vehicle, premium: flatRate(0.165) }, 4000, 1500);
    expect(Math.abs(result.targetBid - asFlatRate.targetBid)).toBeGreaterThan(100);
  });
});

describe('a cheap lot, where the premium is larger than the lot', () => {
  // 22 of the 36 lots in the real sale sat below $2,000, where the premium is
  // a flat $495 no matter how little the hammer price is.
  const cheap: BidInputs = {
    ...vehicle,
    resale: 1500,
    otherCosts: 200,
  };

  it('takes the whole fixed premium off the bid, not a percentage of it', () => {
    const breakEven = bidLimits(cheap, 0, 0).breakEvenBid;
    const basis = bidLimits(cheap, 0, 0);
    // Net resale, less the costs, less the entire $495 premium.
    expect(breakEven).toBeCloseTo(basis.netResale - basis.effectiveOtherCosts - 495, 2);
  });

  it('advises nothing at all when the premium alone exceeds what the lot is worth', () => {
    expect(bidLimits({ ...cheap, resale: 400 }, 0, 0).breakEvenBid).toBe(0);
  });
});

describe('worked example 4 from the spec, a premium charged as a fixed amount', () => {
  // docs/02-specs/bid-calculation.md. These figures are on that page, and this
  // test fails if any of them changes.
  const lot: BidInputs = {
    resale: 9500,
    resaleIncludesGst: true,
    premium: graysVehicleSchedule,
    gstOnHammer: true,
    gstOnPremium: true,
    otherCosts: 1200,
    otherCostsIncludeGst: true,
    gstRegistered: true,
  };
  const result = bidLimits(lot, 2000, 750);

  it('works out the basis', () => {
    expect(result.netResale).toBeCloseTo(8636.36, 2);
    expect(result.effectiveOtherCosts).toBeCloseTo(1090.91, 2);
  });

  it('produces the three bid figures on the page', () => {
    expect(result.targetBid).toBeCloseTo(4895.45, 2);
    expect(result.limitBid).toBeCloseTo(6085.45, 2);
    expect(result.breakEvenBid).toBeCloseTo(6835.45, 2);
  });

  it('shows them rounded down', () => {
    expect(displayBidLimits(result)).toEqual({
      targetBid: 4895,
      limitBid: 6085,
      breakEvenBid: 6835,
    });
  });

  it('takes the whole fixed premium off, where a single rate would not', () => {
    // The page says a flat 16.5 percent advises $4,760, which is $135 lower.
    const asFlatRate = bidLimits({ ...lot, premium: flatRate(0.165) }, 2000, 750);
    expect(asFlatRate.targetBid).toBeCloseTo(4760.05, 2);
    expect(result.targetBid - asFlatRate.targetBid).toBeCloseTo(135.4, 1);
  });
});
