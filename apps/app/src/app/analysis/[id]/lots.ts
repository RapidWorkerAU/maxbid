// Reading an analysis's lots for the triage table.
//
// Kept out of the page file so the page stays under the 80 line limit and so
// the shaping can be tested without a database.

import type { LotRowLot } from '@maxbid/ui/composites/LotRow';

/** A lot row joined to whatever triage decided about it. */
export type LotRecord = {
  id: string;
  lot_number: string;
  title: string;
  current_bid: number | string | null;
  closes_at: string | null;
  raw?: unknown;
};

/** What triage worked out a lot is worth, for this organisation. */
export type AnalysisLotRecord = {
  lot_id: string;
  triage_low: number | string | null;
  triage_high: number | string | null;
  triage_max_bid: number | string | null;
  opportunity_score: number | null;
};

export type IdentificationRecord = {
  lot_id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  confidence: number | string | null;
  condition_notes: string | null;
};

/**
 * What we decided a lot is, in words.
 *
 * Returns null when we decided nothing usable. An empty string would leave a
 * blank cell that reads as a failure rather than as work not done yet.
 */
export function describeIdentification(row: IdentificationRecord): string | null {
  const parts = [row.year, row.brand, row.model].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
}

/** Joins the lots to their identifications for the table. */
/** Postgres numerics arrive as strings, and Money needs a number. */
function asNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toRows(
  lots: LotRecord[],
  identifications: IdentificationRecord[],
  ranges: AnalysisLotRecord[] = [],
): LotRowLot[] {
  const byLot = new Map(identifications.map((row) => [row.lot_id, row]));
  const rangeByLot = new Map(ranges.map((row) => [row.lot_id, row]));

  const rows = lots.map((lot) => {
    const found = byLot.get(lot.id);
    const range = rangeByLot.get(lot.id);
    const confidence = asNumber(found?.confidence);

    return {
      id: lot.id,
      lotNumber: lot.lot_number,
      title: lot.title,
      currentBid: asNumber(lot.current_bid),
      closesAt: lot.closes_at,
      identifiedAs: found ? describeIdentification(found) : null,
      confidence,
      conditionNote: found?.condition_notes ?? null,
      // Both ends or neither. Half a range is not a range, and one figure on
      // its own would be read as a single estimate.
      resaleLow: asNumber(range?.triage_low),
      resaleHigh: asNumber(range?.triage_high),
      maxBid: asNumber(range?.triage_max_bid),
      score: range?.opportunity_score ?? null,
    };
  });

  // Best first, which is the whole point of scoring them. A lot with no score
  // sits below every lot that has one, because it is not that it scored badly
  // but that we could not say.
  return rows.sort((a, b) => {
    const scoreA = a.score ?? -1;
    const scoreB = b.score ?? -1;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.lotNumber.localeCompare(b.lotNumber);
  });
}

/**
 * The sentence above the table saying what is not there yet.
 *
 * SC05 wants a resale range, an opportunity score and a maximum bid, and none
 * of them exist. Saying so is better than a column of blanks, which invites
 * the reader to supply their own answer.
 */
export function pendingNoteFor(identified: number, total: number): string | undefined {
  if (total === 0) return undefined;

  if (identified === 0) {
    return 'We have read the catalogue. We are still working out what each lot is, and this list fills in as we go.';
  }

  if (identified < total) {
    return `We have worked out what ${identified} of ${total} lots are, and this list fills in as we go. A rough resale range and the most you should bid are added once the valuation stage runs.`;
  }

  return 'This list shows what each lot is and what it is bid to now. A rough resale range and the most you should bid are added once the valuation stage runs.';
}
