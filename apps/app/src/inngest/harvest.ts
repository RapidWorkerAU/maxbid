// Recording what every lot of a closed sale sold for. Decision record 0021.
//
// There is no public index of past auction results, so MaxBid keeps its own.
// The lot URLs are already in the database from extraction, so this needs no
// searching at all: one pass per sale, one fetch per lot, and no guessing
// about what a search engine happened to crawl.
//
// A result is public information about a completed sale, so it is stored once
// and read by every organisation and every later analysis.

import { createServiceSupabase } from '@maxbid/db/server';
import { fetchPage } from '../extract/firecrawl';
import { parseGraysResult } from '../extract/graysResult';

export const STAGE = 'S7';

/**
 * How long after a lot closes before its result is read.
 *
 * Grays shows "Sold for" as soon as bidding ends, but a sale closes lot by
 * lot, and a page read too early still says "Ends in". An hour is comfortably
 * past the last lot of a staggered sale.
 */
export const SETTLE_MINUTES = 60;

export type LotToHarvest = {
  id: string;
  lot_number: string;
  source_url: string | null;
};

export type HarvestedLot = {
  lotId: string;
  soldPrice: number | null;
  soldAt: string | null;
  bidCount: number | null;
  didNotSell: boolean;
};

/** True when every lot of a sale has closed and settled. */
export function readyToHarvest(closesAt: string | null, now: Date = new Date()): boolean {
  if (!closesAt) return false;
  const closed = new Date(closesAt).getTime();
  if (Number.isNaN(closed)) return false;
  return now.getTime() - closed >= SETTLE_MINUTES * 60_000;
}

/**
 * Reads one lot's result from its page.
 *
 * A lot that closed without selling is recorded as such rather than skipped.
 * "This model has failed to sell three times" says something about demand
 * that an absence never could.
 */
export async function harvestLot(lot: LotToHarvest): Promise<HarvestedLot | null> {
  if (!lot.source_url) return null;

  const page = await fetchPage(lot.source_url);
  const result = parseGraysResult(page.markdown);

  if (!result) {
    // The page loaded and states no sold price. That is a lot that did not
    // sell, which is a result rather than a failure to read one.
    return {
      lotId: lot.id,
      soldPrice: null,
      soldAt: null,
      bidCount: null,
      didNotSell: true,
    };
  }

  return {
    lotId: lot.id,
    soldPrice: result.hammerPrice,
    soldAt: result.closedAt,
    bidCount: result.bidCount,
    didNotSell: false,
  };
}

/** Writes what a lot did, onto the lot itself. */
export async function storeResult(harvested: HarvestedLot) {
  const { error } = await createServiceSupabase()
    .from('lots')
    .update({
      sold_price: harvested.soldPrice,
      sold_at: harvested.soldAt,
      bid_count: harvested.bidCount,
      did_not_sell: harvested.didNotSell,
    })
    .eq('id', harvested.lotId);
  if (error) throw new Error(`Could not store the result: ${error.message}`);
}

/** Marks a sale as gathered, with how many lots were read. */
export async function markHarvested(auctionId: string, count: number) {
  const { error } = await createServiceSupabase()
    .from('auctions')
    .update({ results_harvested_at: new Date().toISOString(), results_harvested_count: count })
    .eq('id', auctionId);
  if (error) throw new Error(`Could not mark the sale as harvested: ${error.message}`);
}

/** The sales whose results are worth reading now. */
export async function salesReadyToHarvest(limit = 5) {
  const cutoff = new Date(Date.now() - SETTLE_MINUTES * 60_000).toISOString();
  const { data, error } = await createServiceSupabase()
    .from('auctions')
    .select('id, closes_at')
    .is('results_harvested_at', null)
    .not('closes_at', 'is', null)
    .lt('closes_at', cutoff)
    .order('closes_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Could not find sales to harvest: ${error.message}`);
  return data ?? [];
}
