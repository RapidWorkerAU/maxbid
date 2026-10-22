// The queries behind the lot detail screen.
//
// Apart from the page so the page stays under the 80 line limit, and so what
// is shared and what is this organisation's own is visible in one place.
//
// What the lot is and what it resells for are read from the shared tables,
// because neither depends on who is buying. The bid figures come from the
// organisation's own row. Decision record 0024.

import { preferCorrection } from '../../../../../lib/identifications';
import type { supabaseServer } from '../../../../../lib/supabase';
import { asNumber } from './lot';

// Taken from the function that makes it rather than imported, so this file
// does not depend on the client library directly.
type Client = Awaited<ReturnType<typeof supabaseServer>>;

/** One identification row, as this page selects it. */
type IdentificationRow = {
  id: string;
  lot_id: string;
  analysis_id: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  confidence: number | string | null;
  condition_notes: string | null;
};

/** What the screen says when a figure is missing, rather than showing a blank. */
const NO_RANGE =
  'We could not find enough comparable sales to work out what this lot is worth, so we cannot work out a bid from it.';
const NO_IDENTIFICATION =
  'We could not work out what this lot is, so there is nothing to compare it against.';

export async function readLot(supabase: Client, analysisId: string, lotId: string) {
  const { data: lot } = await supabase
    .from('lots')
    .select('id, lot_number, title, current_bid, closes_at, auctions(title)')
    .eq('id', lotId)
    .maybeSingle();
  if (!lot) return null;

  const [identifications, valuation, own] = await Promise.all([
    supabase
      .from('lot_identifications')
      .select('id, lot_id, brand, model, year, confidence, condition_notes, analysis_id')
      .eq('lot_id', lotId)
      .eq('is_current', true)
      .or(`analysis_id.is.null,analysis_id.eq.${analysisId}`),
    supabase
      .from('triage_valuations')
      .select('conservative, expected, optimistic, confidence')
      .eq('lot_id', lotId)
      .eq('is_current', true)
      .maybeSingle(),
    supabase
      .from('analysis_lots')
      .select('triage_low, triage_high, triage_max_bid')
      .eq('analysis_id', analysisId)
      .eq('lot_id', lotId)
      .maybeSingle(),
  ]);

  const found = preferCorrection((identifications.data ?? []) as IdentificationRow[])[0];

  // The evidence hangs off the identification rather than the lot, because a
  // comparable is only a comparable to something: grading it needed to know
  // what the lot was. So this reads the evidence for whichever identification
  // the screen is showing, which keeps the two consistent. An organisation
  // that corrected the identification sees the evidence gathered against
  // their correction, not against the baseline it replaced.
  const evidence = found
    ? await supabase
        .from('lot_comparables')
        .select(
          'id, match_level, weight, excluded_by_user, comparable_snapshots(price, checked_at), comparables(title, url, source_type, source_name)',
        )
        .eq('identification_id', found.id)
    : { data: [] };

  const identifiedAs = found
    ? [found.year, found.brand, found.model].filter(Boolean).join(' ') || null
    : null;

  // The organisation's own correction to the range wins, as it does in the
  // list. Both ends or neither, so a corrected low is never paired with a
  // shared high.
  const ownLow = asNumber(own.data?.triage_low);
  const ownHigh = asNumber(own.data?.triage_high);
  const corrected = ownLow !== null && ownHigh !== null;

  const conservative = corrected ? ownLow : asNumber(valuation.data?.conservative);
  const optimistic = corrected ? ownHigh : asNumber(valuation.data?.optimistic);

  return {
    lot: {
      lotNumber: lot.lot_number,
      title: lot.title,
      currentBid: asNumber(lot.current_bid),
      closesAt: lot.closes_at,
      saleTitle: lot.auctions?.title ?? null,
      identifiedAs,
      identificationConfidence: asNumber(found?.confidence),
      conditionNote: found?.condition_notes ?? null,
    },
    valuation: {
      conservative,
      // Shown only where it came from the shared valuation. A corrected range
      // has two ends and no middle, and inventing one would be our figure
      // presented as theirs.
      expected: corrected ? null : asNumber(valuation.data?.expected),
      optimistic,
      confidence: corrected ? null : asNumber(valuation.data?.confidence),
    },
    // Only the one figure is stored. The limit and break even bids are worked
    // out alongside it and not kept, so they are left out rather than guessed
    // at: the calculator panel recomputes all three. UI20.
    bids: {
      targetBid: asNumber(own.data?.triage_max_bid),
      limitBid: null,
      breakEvenBid: null,
    },
    missingBidReason:
      identifiedAs === null ? NO_IDENTIFICATION : conservative === null ? NO_RANGE : undefined,
    method: undefined as string | undefined,
    evidence: evidence.data ?? [],
  };
}
