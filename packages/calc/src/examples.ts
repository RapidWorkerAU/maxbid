// The worked examples from docs/02-specs/bid-calculation.md, shared by the tests.
// Change these only when the spec changes.

import type { BidInputs } from './types';

/** Worked examples 1 and 2. A GST registered buyer. */
export const registered: BidInputs = {
  resale: 18500,
  resaleIncludesGst: true,
  premiumRate: 0.165,
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
