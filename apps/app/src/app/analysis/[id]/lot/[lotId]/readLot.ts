// The queries behind the lot detail screen.
//
// Apart from the page so the page stays under the 80 line limit, and so what
// is shared and what is this organisation's own is visible in one place.
//
// What the lot is and what it resells for are read from the shared tables,
// because neither depends on who is buying. The bid figures come from the
// organisation's own row. Decision record 0024.

import type { PremiumSchedule } from '@maxbid/calc';
import { canShowBidFigures } from '@maxbid/db';
import { targetBidFor } from '../../../../../inngest/targetBid';
import { bidFreshnessNote } from '../../lots';
import { preferCorrection } from '../../../../../lib/identifications';
import type { supabaseServer } from '../../../../../lib/supabase';
import { asNumber, auctionMarketIn } from './lot';

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

const NO_PROFILE =
  'Tell us your costs and the profit you want, and we will work out the most you should bid.';
const NO_PREMIUM =
  'We could not read this auction’s buyer’s premium, so a bid worked out from it would be missing a real cost.';

/** Everything the screen reads, in as few round trips as the joins allow. */
async function readRows(supabase: Client, analysisId: string, lotId: string) {
  const [identifications, valuation, own, analysis] = await Promise.all([
    supabase
      .from('lot_identifications')
      .select('id, lot_id, brand, model, year, confidence, condition_notes, analysis_id')
      .eq('lot_id', lotId)
      .eq('is_current', true)
      .or(`analysis_id.is.null,analysis_id.eq.${analysisId}`),
    supabase
      .from('triage_valuations')
      .select(
        'conservative, expected, optimistic, confidence, auction_low, auction_typical, auction_high, auction_results',
      )
      .eq('lot_id', lotId)
      .eq('is_current', true)
      .maybeSingle(),
    supabase
      .from('analysis_lots')
      .select('triage_low, triage_high, triage_max_bid')
      .eq('analysis_id', analysisId)
      .eq('lot_id', lotId)
      .maybeSingle(),
    // The buyer's own figures, which is what makes the three bid limits
    // theirs rather than ours.
    supabase
      .from('analyses')
      .select('org_id, organisations(gst_registered)')
      .eq('id', analysisId)
      .maybeSingle(),
  ]);

  // After the analysis, because it is what says which organisation to ask.
  const profile = analysis.data?.org_id
    ? await supabase
        .from('cost_profiles')
        .select(
          'profit_mode, target_profit_amount, target_return_pct, min_profit_amount, min_return_pct, completed_at',
        )
        .eq('org_id', analysis.data.org_id)
        .eq('is_default', true)
        .maybeSingle()
    : { data: null };

  return { identifications, valuation, own, analysis, profile };
}

export async function readLot(supabase: Client, analysisId: string, lotId: string) {
  const { data: lot } = await supabase
    .from('lots')
    .select(
      'id, lot_number, title, current_bid, closes_at, bid_checked_at, auction_id, auctions(title, premium_schedule)',
    )
    .eq('id', lotId)
    .maybeSingle();
  if (!lot) return null;

  const { identifications, valuation, own, analysis, profile } = await readRows(
    supabase,
    analysisId,
    lotId,
  );

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
          'id, match_level, weight, reason, excluded_by_user, comparable_snapshots(price, checked_at), comparables(title, url, source_type, source_name)',
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

  const premium = (lot.auctions?.premium_schedule ?? null) as PremiumSchedule | null;
  const limits =
    conservative === null
      ? null
      : targetBidFor(
          conservative,
          {
            gstRegistered: Boolean(analysis.data?.organisations?.gst_registered),
            profile: profile.data ?? null,
          },
          // Grays states GST is not added to the final bid price on these
          // sales, which is what S5 assumes too.
          { premium, gstOnHammer: false },
        );

  // One reason, and the first one that applies. A reader with no cost profile
  // and an unidentified lot has one thing to fix first, and listing both
  // would not tell them which.
  const whyNoBid =
    limits !== null
      ? undefined
      : identifiedAs === null
        ? NO_IDENTIFICATION
        : conservative === null
          ? NO_RANGE
          : !canShowBidFigures(profile.data ?? null)
            ? NO_PROFILE
            : NO_PREMIUM;

  return {
    lot: lotShown(lot, found, identifiedAs),
    valuation: {
      conservative,
      // Shown only where it came from the shared valuation. A corrected range
      // has two ends and no middle, and inventing one would be our figure
      // presented as theirs.
      expected: corrected ? null : asNumber(valuation.data?.expected),
      optimistic,
      confidence: corrected ? null : asNumber(valuation.data?.confidence),
      // What it takes to win one of these. Shown beside the resale rather than
      // inside it, because a hammer price is what a reseller paid to buy.
      auctionMarket: auctionMarketIn(valuation.data),
    },
    // All three figures, worked out here rather than read back. Only the
    // target bid is stored, because the ranking needs one number. The limit
    // and break even bids come from the same resale and the same costs, so
    // recomputing them is cheaper than keeping three copies that could drift
    // apart.
    bids: limits ?? { targetBid: null, limitBid: null, breakEvenBid: null },
    missingBidReason: whyNoBid,
    method: limits ? methodFor(conservative!) : undefined,
    evidence: evidence.data ?? [],
    // What the correction form starts on, which is whatever we think now.
    current: {
      brand: found?.brand ?? null,
      model: found?.model ?? null,
      year: found?.year ?? null,
      conditionNotes: found?.condition_notes ?? null,
    },
    correctedByYou: found?.analysis_id != null,
  };
}

/**
 * How the bid figures were worked out, in words. F59.
 *
 * The steps bid-calculation.md lists, said as a sentence rather than as a
 * formula, because the reader is checking whether we understood their
 * situation rather than checking our arithmetic.
 */
export function methodFor(resale: number): string {
  const amount = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(resale);

  return [
    `We started from the cautious resale of ${amount}.`,
    'We took off this auction’s buyer’s premium and the GST on it, then your costs, then the profit you said you want.',
    'The figure left is the most you can bid and still reach that profit.',
  ].join(' ');
}

/** The lot as the screen reads it, apart so readLot stays inside its limit. */
function lotShown(
  lot: {
    lot_number: string;
    title: string;
    current_bid: number | string | null;
    closes_at: string | null;
    bid_checked_at: string | null;
    auctions: { title: string | null } | null;
  },
  found: IdentificationRow | undefined,
  identifiedAs: string | null,
) {
  return {
    lotNumber: lot.lot_number,
    title: lot.title,
    currentBid: asNumber(lot.current_bid),
    closesAt: lot.closes_at,
    saleTitle: lot.auctions?.title ?? null,
    identifiedAs,
    identificationConfidence: asNumber(found?.confidence),
    // A correction has an analysis behind it. The baseline does not.
    correctedByYou: found?.analysis_id != null,
    conditionNote: found?.condition_notes ?? null,
    // The same sentence the list carries, so a reader who clicks through does
    // not lose the one fact that says how current the bid is.
    bidNote: bidFreshnessNote([{ closes_at: lot.closes_at, bid_checked_at: lot.bid_checked_at }]),
  };
}
