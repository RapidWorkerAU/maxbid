'use client';

import { TriageTable } from '@maxbid/ui/sections/TriageTable';
import {
  LotFilters,
  locationsIn,
  matchesFilters,
  paramsFromFilters,
  type LotFilterState,
} from '@maxbid/ui/composites/LotFilters';
import type { LotRowLot } from '@maxbid/ui/composites/LotRow';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

/**
 * The triage table, with the filters that narrow it. F16.
 *
 * A client component because filtering is the one thing on this page that
 * happens without the server, and rule 9 puts use client on the smallest
 * component that needs it. The table itself stays presentational.
 *
 * The filters arrive from the server, read out of the query string, so the
 * first render already has them. Holding them in state as well keeps typing
 * responsive, and the URL is updated after the fact so a reload or a shared
 * link still carries them.
 *
 * Filtering happens here rather than in the query because the page refreshes
 * itself every five seconds while the pipeline runs, and asking the server
 * each time would make every one of those a round trip.
 */
export type FilteredLotsProps = {
  lots: (LotRowLot & { location?: string | null })[];
  initialFilters: LotFilterState;
  hrefFor: (lotId: string) => string;
  caption?: string;
  pendingNote?: string;
};

export function FilteredLots({
  lots,
  initialFilters,
  hrefFor,
  caption,
  pendingNote,
}: FilteredLotsProps) {
  const [filters, setFilters] = useState(initialFilters);
  const router = useRouter();
  const pathname = usePathname();

  const change = (next: LotFilterState) => {
    setFilters(next);
    const query = paramsFromFilters(next).toString();
    // replace rather than push, so the back button leaves the catalogue
    // rather than walking back through every filter the reader tried.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const locations = useMemo(() => locationsIn(lots), [lots]);
  const shown = useMemo(() => lots.filter((lot) => matchesFilters(lot, filters)), [lots, filters]);

  return (
    <>
      <LotFilters
        className="mt-10"
        filters={filters}
        onChange={change}
        locations={locations}
        showing={{ shown: shown.length, total: lots.length }}
      />
      <TriageTable
        className="mt-4"
        lots={shown}
        hrefFor={hrefFor}
        caption={caption}
        pendingNote={pendingNote}
      />
    </>
  );
}
