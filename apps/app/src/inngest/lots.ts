// Writing lots, and opening a row per lot in the analysis.
//
// These sit apart from the S2 function so that the function itself stays
// readable. Both work in batches, so one 300 lot catalogue is not one huge
// insert.

import type { Json } from '@maxbid/db';
import { createServiceSupabase } from '@maxbid/db/server';
import type { ParsedLot } from '../extract/grays';

/** Lots are written in batches, so one huge catalogue is not one huge insert. */
export const BATCH_SIZE = 100;

export function lotRows(auctionId: string, lots: ParsedLot[]) {
  return lots.map((lot) => ({
    auction_id: auctionId,
    lot_number: lot.lotNumber,
    title: lot.title,
    source_url: lot.lotUrl,
    closes_at: lot.closesAt ?? null,
    current_bid: lot.currentBid ?? null,
    // The slice of the payload that produced this lot. The whole page lives
    // in raw_extract.
    raw: { ...lot } as Json,
  }));
}

/**
 * Writes the lots and hands back their ids, keyed by lot number.
 *
 * The ids are needed straight away, because the analysis needs a row pointing
 * at each lot, and looking them up again afterwards would be a second pass
 * over the same rows.
 */
export async function writeLots(auctionId: string, lots: ParsedLot[]) {
  const supabase = createServiceSupabase();
  const rows = lotRows(auctionId, lots);
  const ids: Record<string, string> = {};

  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const { data, error } = await supabase
      .from('lots')
      .upsert(rows.slice(start, start + BATCH_SIZE), { onConflict: 'auction_id,lot_number' })
      .select('id, lot_number');
    if (error) throw new Error(`Could not write the lots: ${error.message}`);
    for (const row of data ?? []) ids[row.lot_number] = row.id;
  }

  return ids;
}

/**
 * Gives the analysis a row for every lot in the catalogue.
 *
 * A lot is shared between organisations but what it is worth to one of them is
 * theirs alone, and that is what these rows hold. Nothing created them before,
 * so triage had nowhere to write a range to.
 */
export async function openAnalysisLots(analysisId: string, lotIds: string[]) {
  const supabase = createServiceSupabase();
  const rows = lotIds.map((lotId) => ({
    analysis_id: analysisId,
    lot_id: lotId,
    status: 'triaged',
  }));

  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const { error } = await supabase
      .from('analysis_lots')
      .upsert(rows.slice(start, start + BATCH_SIZE), { onConflict: 'analysis_id,lot_id' });
    if (error) throw new Error(`Could not open the analysis lots: ${error.message}`);
  }

  return rows.length;
}
