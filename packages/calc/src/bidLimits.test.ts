import { describe, expect, it } from 'vitest';
import { bidLimits, profitAt, type BidInputs } from './bidLimits';

// Worked example from workbook tab 10.
const example: BidInputs = {
  resale: 18500,
  resaleIncludesGst: true,
  premiumRate: 0.165,
  gstOnHammer: true,
  gstOnPremium: true,
  otherCosts: 3930,
  otherCostsIncludeGst: true,
  gstRegistered: true,
};

describe('bidLimits', () => {
  it('matches the workbook to the cent for a GST registered buyer', () => {
    const r = bidLimits(example, 4000, 1500);
    expect(r.targetBid).toBeCloseTo(7936.01, 2);
    expect(r.absoluteMax).toBeCloseTo(10081.94, 2);
    expect(r.breakEven).toBeCloseTo(11369.49, 2);
  });

  it('gives exactly the target profit at the target bid', () => {
    const r = bidLimits(example, 4000, 1500);
    expect(profitAt(example, r.targetBid)).toBeCloseTo(4000, 6);
  });

  it('never returns a negative bid', () => {
    const r = bidLimits({ ...example, resale: 1000 }, 4000, 1500);
    expect(r.targetBid).toBe(0);
  });
});
