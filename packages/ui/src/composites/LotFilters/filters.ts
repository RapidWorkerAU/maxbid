// The rules that decide which lots a reader sees. F16.
//
// Deliberately in its own file with no "use client" on it. The controls next
// door are a client component, and everything exported from a client module
// is a client export, so calling one of these from a server page fails at
// runtime with "attempted to call it from the server".
//
// Nothing caught that: unit tests do not enforce the boundary and the story
// tests render in a browser where everything is a client. Only opening the
// page did. Keeping the rules apart from the controls is what stops it
// happening again, and it is the right split anyway, because these decide
// what somebody sees and the controls only collect what they asked for.

/**
 * UI55. Narrowing a catalogue down. F16.
 *
 * A reseller looking at three hundred lots is looking for the handful that
 * suit them, and the three things that decide it are what a lot is worth,
 * where it is and when it closes. A lot across the country is a different
 * proposition from one an hour away, whatever the figures say.
 *
 * **Filtering hides lots, so it only ever hides them on the reader's
 * instruction.** A lot we could not value is kept whatever the value filter
 * says, unless the reader turns it off themselves, because we do not know
 * that it falls outside their range: we know we could not say. Dropping it
 * quietly would be us deciding what they get to see.
 *
 * F16 also asks for a category filter. Nothing we hold has a category, and
 * within one sale every lot is the same kind of thing anyway, so there is
 * nothing to filter on. Raised as O21 rather than invented.
 */
export type LotFilterState = {
  /** The least a lot must be worth bidding, in dollars. Null means no floor. */
  minMaxBid: number | null;
  /** Hours until close. Null means any. */
  closingWithinHours: number | null;
  /** A location as the catalogue writes it, such as "Altona North, VIC". */
  location: string | null;
  /** Lots we could not value. On by default, because we did not say no. */
  includeUnvalued: boolean;
};

export const NO_FILTERS: LotFilterState = {
  minMaxBid: null,
  closingWithinHours: null,
  location: null,
  includeUnvalued: true,
};

/** What a filter decides about, which is less than a whole row. */
export type FilterableLot = {
  maxBid?: number | null;
  closesAt?: string | null;
  location?: string | null;
};

/**
 * Whether one lot survives the filters.
 *
 * Pure, and the whole rule, because this is what decides whether a reader
 * ever sees a lot.
 */
export function matchesFilters(
  lot: FilterableLot,
  filters: LotFilterState,
  now: Date = new Date(),
): boolean {
  const valued = lot.maxBid !== null && lot.maxBid !== undefined;

  // A lot we could not value is not a lot outside the range. It is a lot we
  // cannot place, and the reader decides whether to see it.
  if (!valued && !filters.includeUnvalued) return false;
  if (valued && filters.minMaxBid !== null && lot.maxBid! < filters.minMaxBid) return false;

  if (filters.location && lot.location !== filters.location) return false;

  if (filters.closingWithinHours !== null) {
    if (!lot.closesAt) return false;
    const closes = new Date(lot.closesAt).getTime();
    if (!Number.isFinite(closes)) return false;
    const hoursLeft = (closes - now.getTime()) / 3_600_000;
    if (hoursLeft > filters.closingWithinHours) return false;
  }

  return true;
}

/** Every location in a catalogue, in order, for the filter to offer. */
export function locationsIn(lots: FilterableLot[]): string[] {
  const seen = new Set<string>();
  for (const lot of lots) if (lot.location) seen.add(lot.location);
  return [...seen].sort((a, b) => a.localeCompare(b));
}

/**
 * Filters read from a query string, and written back to one.
 *
 * The URL is where they live rather than browser storage, for three reasons.
 * The server can read it, so the first render already has them and there is
 * no effect reaching into the browser after the fact. They survive a reload,
 * which matters on a page that refreshes itself every five seconds. And a
 * narrowed catalogue is a link somebody can send to somebody else.
 */
export function filtersFromParams(params: Record<string, string | undefined>): LotFilterState {
  const number = (value: string | undefined) => {
    if (value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    minMaxBid: number(params.min),
    closingWithinHours: number(params.closing),
    location: params.where || null,
    // Only an explicit no hides them. Anything else, including a value we do
    // not recognise, shows them, because the safe reading of a broken filter
    // is the one that hides nothing.
    includeUnvalued: params.unvalued !== 'no',
  };
}

export function paramsFromFilters(filters: LotFilterState): URLSearchParams {
  const params = new URLSearchParams();
  // Only what has been set. A query string full of empty values is noise in
  // a link somebody is about to send.
  if (filters.minMaxBid !== null) params.set('min', String(filters.minMaxBid));
  if (filters.closingWithinHours !== null)
    params.set('closing', String(filters.closingWithinHours));
  if (filters.location) params.set('where', filters.location);
  if (!filters.includeUnvalued) params.set('unvalued', 'no');
  return params;
}
