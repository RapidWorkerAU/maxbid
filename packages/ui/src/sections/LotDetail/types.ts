// What the lot screen is given. UI49.
//
// In its own file so the panels can read the same types that LotDetail does
// without the two files importing each other.

import type { ReactNode } from 'react';
import type { Comparable } from '../../composites/EvidenceRow';

export type LotDetailLot = {
  /** The auction's own lot number, such as 0004-23502418. */
  lotNumber: string;
  /** What the catalogue called it. */
  title: string;
  currentBid: number | null;
  /** True where this organisation corrected the identification themselves. F19. */
  correctedByYou?: boolean;
  /** When the bid was last read from the site. Decision record 0026. */
  bidNote?: string;
  closesAt?: string | null;
  /** What we decided the lot is, in words. Null where we could not say. */
  identifiedAs: string | null;
  /** 0 to 100 from the identification. */
  identificationConfidence?: number | null;
  /** Anything the catalogue said about condition, such as a write off marker. */
  conditionNote?: string | null;
  /** The sale this lot belongs to. */
  saleTitle?: string | null;
};

export type LotDetailValuation = {
  /**
   * What one of these usually fetches at auction, where we know.
   *
   * Never the resale figure. A hammer price is what a reseller paid to buy
   * and a resale price is what the public paid to own, and the gap between
   * them is the margin. It is shown because what it takes to win is a
   * question a bidder genuinely has, and we have the evidence for it.
   */
  auctionMarket?: { low: number; typical: number; high: number; results: number } | null;
  /** The cautious end, which the bid figures are worked out from. */
  conservative: number | null;
  expected: number | null;
  optimistic: number | null;
  /** 0 to 100. Leave out where the evidence threshold was not met. */
  confidence?: number | null;
};

export type LotDetailProps = {
  lot: LotDetailLot;
  valuation: LotDetailValuation;
  comparables: Comparable[];
  bids: { targetBid: number | null; limitBid: number | null; breakEvenBid: number | null };
  /** Why there are no bid figures, when there are none. */
  missingBidReason?: string;
  /** How the figures were worked out, in words. F59. */
  method?: string;
  /**
   * Setting one comparable aside, or putting it back. F62.
   *
   * A function per row rather than a list of controls, so the page decides
   * what each one does and this section only decides where it sits.
   */
  exclusionFor?: (comparable: Comparable) => ReactNode;
  /**
   * What setting them aside did to the figures, in the standard wording. DS17.
   *
   * Passed in already filled, because disclaimer text is never typed into a
   * component and never assembled in one either.
   */
  exclusionNote?: string;
  /**
   * Put under the identification, for correcting it. F19.
   *
   * Passed in rather than built here, because correcting one needs a server
   * action and this package has no server in it.
   */
  correction?: ReactNode;
  className?: string;
};
