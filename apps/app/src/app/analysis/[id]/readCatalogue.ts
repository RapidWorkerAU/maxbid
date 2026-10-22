// The queries behind the triage table.
//
// Apart from the page so the page stays under the 80 line limit, and so what
// is shared and what is this organisation's own is visible in one place.
//
// What a lot is and what it resells for are shared, because neither depends
// on who is buying. The maximum bid and the score are this organisation's
// own. Decision record 0024.

import { preferCorrection } from '../../../lib/identifications';
import { stageFor, type AnalysisStatus } from '../../../lib/stages';
import type { supabaseServer } from '../../../lib/supabase';
import { bidFreshnessNote, pendingNoteFor, rowsFor } from './lots';

type Client = Awaited<ReturnType<typeof supabaseServer>>;

export async function readCatalogue(
  supabase: Client,
  analysisId: string,
  auctionId: string,
  status: string,
) {
  const [lots, identifications, ranges, shared, tried] = await Promise.all([
    supabase
      .from('lots')
      .select('id, lot_number, title, current_bid, closes_at, bid_checked_at, location_text')
      .eq('auction_id', auctionId)
      .order('lot_number'),
    supabase
      .from('lot_identifications')
      .select(
        'lot_id, brand, model, year, confidence, condition_notes, analysis_id, lots!inner(auction_id)',
      )
      .eq('lots.auction_id', auctionId)
      .eq('is_current', true)
      .or(`analysis_id.is.null,analysis_id.eq.${analysisId}`),
    supabase
      .from('analysis_lots')
      .select('lot_id, triage_low, triage_high, triage_max_bid, opportunity_score')
      .eq('analysis_id', analysisId),
    supabase
      .from('triage_valuations')
      .select('lot_id, conservative, optimistic, confidence, lots!inner(auction_id)')
      .eq('lots.auction_id', auctionId)
      .eq('is_current', true),
    // Which lots we have already tried to value and could not. Without this a
    // blank figure cannot say whether we looked and found nothing or have not
    // looked yet, and the row would claim the first in both cases.
    supabase
      .from('valuation_attempts')
      .select('lot_id, lots!inner(auction_id)')
      .eq('lots.auction_id', auctionId),
  ]);

  const rows = rowsFor(
    lots.data ?? [],
    preferCorrection(identifications.data ?? []),
    ranges.data ?? [],
    shared.data ?? [],
    {
      settled: stageFor(status as AnalysisStatus).settled,
      attempted: new Set((tried.data ?? []).map((row) => row.lot_id)),
    },
  );

  const identified = rows.filter((row) => row.identifiedAs).length;
  const note = [pendingNoteFor(identified, rows.length), bidFreshnessNote(lots.data ?? [])]
    .filter(Boolean)
    .join(' ');

  return { rows, note };
}
