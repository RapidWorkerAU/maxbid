// Gathering the evidence a lot is valued against. S5, decision record 0020.
//
// Auction results first, web listings only to fill out. A result is a sold
// price weighted 0.95 and carries a date; a listing is an asking price
// weighted 0.6 with no date at all. Five listings barely reach the evidence
// threshold and three results clear it comfortably.
//
// Both are kept, because they answer different questions. A result says what
// the thing fetches under a hammer, which matching-and-valuation.md calls a
// resale floor. A listing says what a forecourt asks for it. A reseller lives
// in the gap between the two, so neither on its own is the whole picture.

import type { Comparable } from '@maxbid/calc';
import type { AuctionResult } from '../search/auctionResults';
import { gradeForUsage, type ValuedComparable } from './valueLot';

/** Enough sold results that looking further is spending for nothing. */
export const ENOUGH_RESULTS = 4;

/**
 * True when the auction results alone are worth valuing on.
 *
 * Below this we still search the web, because a lot with one past sale needs
 * whatever else can be found. Above it we stop, because each web listing
 * costs a search, a read and often a page fetch to add a comparable worth
 * well under half as much.
 */
export function enoughOnTheirOwn(results: AuctionResult[]): boolean {
  return results.length >= ENOUGH_RESULTS;
}

/**
 * Turns a past auction result into a comparable.
 *
 * The grade starts at near exact rather than exact. It is the same kind of
 * item at the same kind of sale, but it is a different lot with a different
 * history, and the spec keeps exact for when every stated detail agrees.
 * Usage then moves it, as decision record 0019 requires.
 */
export function resultAsComparable(
  result: AuctionResult,
  lotKilometres: number | null,
  index: number,
): Comparable {
  return {
    id: `result-${index}`,
    price: result.hammerPrice,
    matchLevel: gradeForUsage('nearExact', lotKilometres, result.kilometres),
    evidenceType: 'auctionResult',
    // A real date at last. Every web listing counts as current because Brave
    // gives none, and a result from 2023 should not weigh the same as one
    // from last month.
    ageInDays: result.ageInDays,
  };
}

/** Turns a web listing into a comparable. */
export function listingAsComparable(listing: ValuedComparable): Comparable {
  return {
    id: `listing-${listing.index}`,
    price: listing.price,
    matchLevel: listing.matchLevel,
    evidenceType: listing.advertised ? 'advertisedUsed' : 'marketplaceSold',
    ageInDays: 0,
  };
}

/** Everything a lot is valued against, results first. */
export function allComparables(
  results: AuctionResult[],
  listings: ValuedComparable[],
  lotKilometres: number | null,
): Comparable[] {
  return [
    ...results.map((result, index) => resultAsComparable(result, lotKilometres, index)),
    ...listings.map(listingAsComparable),
  ];
}
