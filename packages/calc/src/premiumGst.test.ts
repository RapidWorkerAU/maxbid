// A premium whose stated amount already includes GST. Decision record 0016.
//
// Both lot pages on the Grays vehicle sale say "GST is included in the buyers
// premium", so the $495 in its table is the whole charge. Before this, the
// calculator had only two states and neither was right: adding GST charged
// $544.50 against the auction's $495, and not adding it charged the right
// amount but never credited the $45 of GST sitting inside it.

import { describe, expect, it } from 'vitest';
import { GST_RATE, bidBasis, costAtHammer } from './basis';
import { graysVehicleSchedule, registered, unregistered } from './examples';
import { cashNeeded, gstCredits, positionAt } from './position';
import { premiumChargedAt, premiumGstAt } from './premium';
import type { BidInputs } from './types';

/** The sale as its pages actually state it. */
const inclusive = { ...graysVehicleSchedule, includesGst: true };

/** Lot 0001 of the sale, at its real bid of $1,609. */
const HAMMER = 1609;
const STATED_PREMIUM = 495;

const lot: BidInputs = {
  ...registered,
  premium: inclusive,
  gstOnHammer: false,
  gstOnPremium: true,
  otherCosts: 0,
  otherCostsIncludeGst: false,
};

describe('what the buyer hands over', () => {
  it('charges exactly what the auction published', () => {
    expect(premiumChargedAt(inclusive, HAMMER, true, GST_RATE)).toBe(STATED_PREMIUM);
  });

  it('does not charge the $544.50 that adding GST would have', () => {
    const asExclusive = premiumChargedAt(graysVehicleSchedule, HAMMER, true, GST_RATE);
    expect(asExclusive).toBeCloseTo(544.5, 2);
    expect(premiumChargedAt(inclusive, HAMMER, true, GST_RATE)).toBeLessThan(asExclusive);
  });

  it('charges the same whether or not the buyer is registered for GST', () => {
    // Registration decides what can be claimed back, never what is charged.
    expect(cashNeeded({ ...lot, gstRegistered: false }, HAMMER)).toBe(cashNeeded(lot, HAMMER));
  });
});

describe('the GST inside that charge', () => {
  it('works it backwards out of the charge rather than multiplying by the rate', () => {
    // A tenth of the price before tax, not a tenth of the price after it.
    expect(premiumGstAt(inclusive, HAMMER, true, GST_RATE)).toBeCloseTo(45, 2);
    expect(premiumGstAt(inclusive, HAMMER, true, GST_RATE)).not.toBeCloseTo(49.5, 1);
  });

  it('credits a registered buyer that GST', () => {
    expect(gstCredits(lot, HAMMER)).toBeCloseTo(45, 2);
  });

  it('credits an unregistered buyer nothing, because they cannot claim it', () => {
    expect(gstCredits({ ...lot, gstRegistered: false }, HAMMER)).toBe(0);
  });
});

describe('what the lot really costs', () => {
  it('costs a registered buyer the hammer plus the premium less the GST in it', () => {
    expect(costAtHammer(lot, HAMMER)).toBeCloseTo(HAMMER + 495 / 1.1, 6);
  });

  it('costs an unregistered buyer the hammer plus the whole premium', () => {
    const notRegistered = { ...lot, gstRegistered: false };
    expect(costAtHammer(notRegistered, HAMMER)).toBeCloseTo(HAMMER + 495, 6);
  });

  it('reconciles with the position at that bid', () => {
    for (const inputs of [lot, { ...lot, gstRegistered: false }]) {
      const position = positionAt(inputs, HAMMER);
      expect(position.costAfterGstCredits).toBeCloseTo(costAtHammer(inputs, HAMMER), 6);
      expect(position.cashNeeded - position.gstCredits).toBeCloseTo(position.costAfterGstCredits, 6);
    }
  });
});

describe('the multiplier on each dollar of stated premium', () => {
  it('is one eleventh off for a registered buyer', () => {
    expect(bidBasis(lot).premiumFactor).toBeCloseTo(1 / 1.1, 10);
  });

  it('is one for an unregistered buyer, who pays the sticker price', () => {
    expect(bidBasis({ ...lot, gstRegistered: false }).premiumFactor).toBe(1);
  });

  it('is unchanged for a schedule that does not include GST', () => {
    // The old behaviour, which every existing worked example relies on.
    expect(bidBasis(registered).premiumFactor).toBe(1);
    expect(bidBasis(unregistered).premiumFactor).toBeCloseTo(1.1, 10);
  });
});
