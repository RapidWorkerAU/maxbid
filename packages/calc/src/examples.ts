// The worked examples from docs/02-specs/bid-calculation.md, shared by the tests.
// Change these only when the spec changes.

import { flatRate, type PremiumSchedule } from './premium';
import type { BidInputs } from './types';

/** Worked examples 1 and 2. A GST registered buyer. */
export const registered: BidInputs = {
  resale: 18500,
  resaleIncludesGst: true,
  premium: flatRate(0.165),
  gstOnHammer: true,
  gstOnPremium: true,
  otherCosts: 3930,
  otherCostsIncludeGst: true,
  gstRegistered: true,
};

/** Worked example 3. The same lot bought by a buyer who is not registered. */
export const unregistered: BidInputs = { ...registered, gstRegistered: false };

export const TARGET_PROFIT = 4000;
export const MIN_PROFIT = 1500;

/**
 * The schedule the Grays Perth motor vehicle sale states, from the first real
 * auction MaxBid read. Decision record 0015 records why it matters: below
 * $10,000 the premium is a fixed amount, so no single rate can stand in for
 * it. The fall from $710 to 7 percent at $10,000 is the edge where paying
 * more costs less.
 */
export const graysVehicleSchedule: PremiumSchedule = {
  bands: [
    { upTo: 2000, kind: 'fixed', amount: 495 },
    { upTo: 5000, kind: 'fixed', amount: 650 },
    { upTo: 10000, kind: 'fixed', amount: 710 },
    { upTo: 30000, kind: 'rate', rate: 0.07 },
    { upTo: 40000, kind: 'rate', rate: 0.06 },
    { upTo: null, kind: 'rate', rate: 0.05 },
  ],
};
