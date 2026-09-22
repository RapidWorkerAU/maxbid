// Display rounding. Set by decision record 0003.

import type { BidLimits, DisplayBidLimits } from './types';

/**
 * Settles a figure to whole cents first.
 *
 * Money arrives from division carrying floating point noise, so a figure that
 * is truly 7936.00 can turn up as 7935.9999999999. Flooring that directly
 * would cost the user a dollar, so settle to cents before rounding.
 */
function toCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Rounds a bid figure down to the nearest whole dollar.
 *
 * Bid figures are never rounded up. Rounding up would advise a bid that the
 * evidence does not support.
 */
export function roundDownToDollar(value: number): number {
  return Math.floor(toCents(value));
}

/** Rounds any other money figure to the nearest whole dollar for display. */
export function roundToDollar(value: number): number {
  return Math.round(toCents(value));
}

/**
 * The three bid figures as they are shown on screen or written to an export.
 * Use this rather than rounding a bid figure yourself.
 */
export function displayBidLimits(limits: BidLimits): DisplayBidLimits {
  return {
    targetBid: roundDownToDollar(limits.targetBid),
    limitBid: roundDownToDollar(limits.limitBid),
    breakEvenBid: roundDownToDollar(limits.breakEvenBid),
  };
}
