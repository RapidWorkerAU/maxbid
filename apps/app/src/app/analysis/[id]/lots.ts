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
export function toRows(
  lots: LotRecord[],
  identifications: IdentificationRecord[],
): LotRowLot[] {
  const byLot = new Map(identifications.map((row) => [row.lot_id, row]));

  return lots.map((lot) => {
    const found = byLot.get(lot.id);
    const confidence = found?.confidence == null ? null : Number(found.confidence);

    return {
      id: lot.id,
      lotNumber: lot.lot_number,
      title: lot.title,
      currentBid: lot.current_bid === null ? null : Number(lot.current_bid),
      closesAt: lot.closes_at,
      identifiedAs: found ? describeIdentification(found) : null,
      confidence: Number.isFinite(confidence) ? confidence : null,
      conditionNote: found?.condition_notes ?? null,
    };
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
