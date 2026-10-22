// Working out, or reading back, what one lot is worth. Decision record 0024.
//
// Split from valueFunction.ts so S5 reads as the order it does things in,
// and so the two paths through a single lot sit side by side: one costs a
// search, a model call and up to four page fetches, and the other costs a
// read. Everything here is per lot. Nothing here knows about the catalogue.

import { createServiceSupabase } from '@maxbid/db/server';
import { rangeFrom, recordFailedAttempt, storeRange, type SharedRange } from './sharedValuation';
import { targetBidFor } from './targetBid';
import { valueLot } from './valueLot';

/** What we know about a lot before valuing it. */
export type LotToValue = {
  lot_id: string;
  /** Only used to decide which lots are worth valuing, never to rank them. */
  lots_current_bid?: number | string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  specs: unknown;
  /** How sure we are of what the lot is. Feeds the confidence score. */
  confidence?: number | string | null;
  /** 'user' means somebody confirmed it, which counts as certain. */
  stage?: string | null;
  lots: { title: string; raw: unknown } | null;
};

/** What the organisation and the auction have told us, read once per run. */
export type ValuingContext = {
  gstRegistered: boolean;
  profile: Parameters<typeof targetBidFor>[1]['profile'];
  premium: Parameters<typeof targetBidFor>[2]['premium'];
  gstOnHammer: boolean;
};

/** The odometer the catalogue stated, which decides the usage grading. */
export function kilometresOf(raw: unknown): number | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const attributes = (raw as Record<string, unknown>).attributes;
  if (typeof attributes !== 'object' || attributes === null) return null;
  const reading = (attributes as Record<string, unknown>).odometer;
  if (typeof reading !== 'string') return null;
  const value = Number(reading.replace(/[^\d]/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** The lot in words, for the model to compare listings against. */
export function describeLot(lot: LotToValue, kilometres: number | null): string {
  const specs = (lot.specs ?? {}) as Record<string, unknown>;
  return [
    lot.year,
    lot.brand,
    lot.model,
    typeof specs.fuel === 'string' ? specs.fuel : null,
    kilometres ? `odometer ${kilometres.toLocaleString()} km` : null,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Works out this organisation's maximum bid from a resale range.
 *
 * The range is shared, because a resale value does not depend on who is
 * buying. This figure is not: it comes from their own profit target, GST
 * position and costs, so it is stored against their analysis.
 *
 * Arithmetic only, with no network in it, which is why a lot we already hold
 * a range for is nearly free to add to a new analysis.
 */
export async function applyRange(
  lotId: string,
  range: SharedRange,
  where: { analysisId: string },
  context: ValuingContext,
) {
  // The conservative resale, not the expected one, because the cautious end
  // of a range is the honest end to work a bid figure from.
  const limits = targetBidFor(
    range.conservative,
    { gstRegistered: context.gstRegistered, profile: context.profile },
    { premium: context.premium, gstOnHammer: context.gstOnHammer },
  );

  const { data, error } = await createServiceSupabase()
    .from('analysis_lots')
    .update({ triage_max_bid: limits?.targetBid ?? null })
    .eq('analysis_id', where.analysisId)
    .eq('lot_id', lotId)
    .select('id');
  if (error) throw new Error(`Could not store the maximum bid: ${error.message}`);

  // An update that matched nothing is not a success. S2 opens a row for every
  // lot in the catalogue, so a missing one means this analysis never ran that
  // stage, which is exactly what happens once a crawled sale is looked up
  // rather than extracted. Saying so beats a blank column the user would read
  // as not enough evidence.
  if ((data ?? []).length === 0) {
    throw new Error(
      `No analysis lot row for lot ${lotId} in analysis ${where.analysisId}, so the maximum bid had nowhere to go.`,
    );
  }
}

/**
 * Values one lot, stores the range for everybody, and returns it.
 *
 * Returns null where the evidence threshold was not met. F26 says a lot we
 * cannot value shows no bid figure, so nothing is stored and the screen reads
 * the blank as not enough evidence rather than as a value of nothing.
 */
export async function valueAndStore(
  lot: LotToValue,
  where: { orgId: string; analysisId: string },
  context: ValuingContext,
): Promise<SharedRange | null> {
  const kilometres = kilometresOf(lot.lots?.raw);
  const result = await valueLot({
    subject: {
      brand: lot.brand,
      model: lot.model,
      year: lot.year,
      specs: (lot.specs ?? {}) as Record<string, unknown>,
    },
    lotKilometres: kilometres,
    describedAs: describeLot(lot, kilometres),
    where: { ...where, lotId: lot.lot_id },
  });

  const range = rangeFrom(result.valuation, {
    confidence:
      lot.confidence === null || lot.confidence === undefined ? null : Number(lot.confidence),
    confirmed: lot.stage === 'user',
  });

  // Nothing worth storing. Record that we tried, so the next analysis and the
  // nightly crawl do not pay for the same search, model call and page fetches
  // to reach the same answer. O19.
  if (!range) {
    await recordFailedAttempt(lot.lot_id, result.valuation);
    return null;
  }

  await storeRange(lot.lot_id, range);
  await applyRange(lot.lot_id, range, where, context);
  return range;
}
