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

// enoughOnTheirOwn used to stop the web search once there were four or more
// auction results, on the grounds that they were enough to value on. They are
// not, and cannot be: a hammer price is what a reseller paid to buy and a
// resale price is what the public paid to own, so no number of auction results
// builds a resale range. It is gone rather than retuned, because there is no
// number of them that would make it right.

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
