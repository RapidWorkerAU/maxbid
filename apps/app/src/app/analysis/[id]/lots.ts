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
  /** Where the lot is, as the catalogue writes it. F16 filters on it. */
  location_text?: string | null;
  raw?: unknown;
};

/**
 * What this organisation holds about a lot.
 *
 * The maximum bid and the score are theirs, because both come from their own
 * profit target and GST position. triage_low and triage_high are an override:
 * null is the ordinary case and means read the shared range. Decision record
 * 0024.
 */
export type AnalysisLotRecord = {
  lot_id: string;
  triage_low: number | string | null;
  triage_high: number | string | null;
  triage_max_bid: number | string | null;
  opportunity_score: number | null;
};

/** The shared resale range, which is the same whoever is buying. */
export type SharedRangeRecord = {
  lot_id: string;
  conservative: number | string | null;
  optimistic: number | string | null;
  /** 0 to 100, in the range itself. What the table's confidence column shows. */
  confidence?: number | string | null;
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

/**
 * The resale range to show for one lot.
 *
 * This organisation's own correction wins where they made one, because they
 * know something about this lot that we do not. Otherwise the shared range,
 * which is what the pipeline worked out for everybody.
 *
 * Both ends or neither, from one source or the other. Half a range is not a
 * range, and mixing a corrected low with a shared high would produce a span
 * nobody worked out and nobody could explain.
 */
export function resaleRangeFor(
  override: AnalysisLotRecord | undefined,
  shared: SharedRangeRecord | undefined,
): { low: number | null; high: number | null } {
  const ownLow = asNumber(override?.triage_low);
  const ownHigh = asNumber(override?.triage_high);
  if (ownLow !== null && ownHigh !== null) return { low: ownLow, high: ownHigh };

  const sharedLow = asNumber(shared?.conservative);
  const sharedHigh = asNumber(shared?.optimistic);
  if (sharedLow !== null && sharedHigh !== null) return { low: sharedLow, high: sharedHigh };

  return { low: null, high: null };
}

export function toRows(
  lots: LotRecord[],
  identifications: IdentificationRecord[],
  ranges: AnalysisLotRecord[] = [],
  shared: SharedRangeRecord[] = [],
): LotRowLot[] {
  const byLot = new Map(identifications.map((row) => [row.lot_id, row]));
  const rangeByLot = new Map(ranges.map((row) => [row.lot_id, row]));
  const sharedByLot = new Map(shared.map((row) => [row.lot_id, row]));

  const rows = lots.map((lot) => {
    const found = byLot.get(lot.id);
    const range = rangeByLot.get(lot.id);
    const shared = sharedByLot.get(lot.id);
    const resale = resaleRangeFor(range, shared);

    // The confidence in the figures on this row, not in what the lot is. The
    // two are different questions and this column sits among the money.
    //
    // Null where the organisation corrected the range themselves: our
    // confidence was in our figure, and theirs has replaced it.
    const confidence =
      resale.low === null || range?.triage_low != null ? null : asNumber(shared?.confidence);

    return {
      id: lot.id,
      lotNumber: lot.lot_number,
      title: lot.title,
      currentBid: asNumber(lot.current_bid),
      location: lot.location_text ?? null,
      closesAt: lot.closes_at,
      identifiedAs: found ? describeIdentification(found) : null,
      confidence,
      conditionNote: found?.condition_notes ?? null,
      resaleLow: resale.low,
      resaleHigh: resale.high,
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

/** Under a minute reads as now, which is what a person means by just checked. */
const JUST_NOW_SECONDS = 60;

/**
 * A sentence saying when we last read the bids from the site.
 *
 * Needed because the figure on screen is labelled the current bid, and once
 * sales are read on a schedule rather than when somebody asks, it may be hours
 * old. Saying so is the honest version of showing it. Decision record 0024.
 *
 * Returns undefined when we have never read a bid for any of these lots. There
 * is nothing to date, and a sentence about a check that never happened would be
 * worse than no sentence.
 *
 * A sentence rather than a tenth column, because the table already carries nine
 * at 360px wide and this is one fact about the whole list rather than about any
 * one lot.
 */
export function bidsCheckedNoteFor(
  checkedAt: (string | null)[],
  now: Date = new Date(),
  hasClosed = false,
): string | undefined {
  const times = checkedAt
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));
  if (times.length === 0) return undefined;

  // A closed sale is a different statement. Its bids cannot move, so dating
  // them and warning they may be out of date would be misleading the other
  // way: these are what the lots finished on, not a figure going stale.
  if (hasClosed) {
    return 'This sale has closed, so these are the last bids we read before it ended.';
  }

  // The oldest, not the newest. A list is only as current as its stalest row,
  // and quoting the newest would describe the best case as the whole picture.
  const oldest = Math.min(...times);
  const seconds = Math.round((now.getTime() - oldest) / 1000);

  if (seconds < JUST_NOW_SECONDS) {
    return 'We checked the current bids just now.';
  }

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `We checked the current bids ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago. A bid can rise at any time, so open the lot on the auction site before you bid.`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `We checked the current bids ${hours} ${hours === 1 ? 'hour' : 'hours'} ago. A bid can rise at any time, so open the lot on the auction site before you bid.`;
  }

  const days = Math.round(hours / 24);
  return `We checked the current bids ${days} ${days === 1 ? 'day' : 'days'} ago, so the figures below may be well out of date. Open the lot on the auction site to see what it is bid to now.`;
}

/**
 * The bid freshness sentence for a list of lots.
 *
 * Wraps the two decisions the screen needs, which lot rows to date and whether
 * the sale has ended, so the page states one fact and asks one question. It
 * also keeps the clock out of the render: a component that reads the time is
 * not a pure function of its inputs, and the React compiler rejects it.
 *
 * A sale has closed when every lot in it has. One lot still running means the
 * sale is still running and the bids can still move.
 */
export function bidFreshnessNote(
  lots: { closes_at: string | null; bid_checked_at: string | null }[],
  now: Date = new Date(),
): string | undefined {
  const hasClosed =
    lots.length > 0 &&
    lots.every((lot) => {
      if (!lot.closes_at) return false;
      const closes = new Date(lot.closes_at).getTime();
      return Number.isFinite(closes) && closes <= now.getTime();
    });

  return bidsCheckedNoteFor(
    lots.map((lot) => lot.bid_checked_at),
    now,
    hasClosed,
  );
}

/**
 * Which stage is still to run for one lot.
 *
 * A blank figure cannot say for itself whether we looked and found nothing or
 * have not looked yet, and the row was reading as the first in both cases.
 * This is what tells them apart.
 *
 * An attempt is the evidence that we looked. Without one, an empty range on a
 * running analysis means the valuation stage has not reached this lot, and
 * "Not enough evidence" would be a claim about work we have not done.
 *
 * Nothing is pending once the analysis has settled. A lot still blank then is
 * a lot we could not do, whether or not an attempt was recorded, and saying
 * it is being worked on would be a wait that never ends.
 */
export function pendingFor(
  lot: { identifiedAs?: string | null; resaleLow?: number | null },
  options: { analysisSettled: boolean; attempted: boolean },
): 'identification' | 'valuation' | null {
  if (options.analysisSettled) return null;
  if (!lot.identifiedAs) return 'identification';
  if (lot.resaleLow == null && !options.attempted) return 'valuation';
  return null;
}

/** Everything the table needs, including what is still being worked out. */
export function rowsFor(
  lots: LotRecord[],
  identifications: IdentificationRecord[],
  ranges: AnalysisLotRecord[],
  shared: SharedRangeRecord[],
  progress: { settled: boolean; attempted: Set<string> },
): LotRowLot[] {
  return toRows(lots, identifications, ranges, shared).map((row) => ({
    ...row,
    pending: pendingFor(row, {
      analysisSettled: progress.settled,
      attempted: progress.attempted.has(row.id),
    }),
  }));
}
