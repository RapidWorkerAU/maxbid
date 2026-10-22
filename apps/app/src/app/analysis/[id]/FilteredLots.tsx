'use client';

import { CreditPreview } from '@maxbid/ui/composites/CreditPreview';
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
import { analyseShortlist } from '../../../lib/shortlist';
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
  /** Credits this organisation has left, for the shortlist preview. F17. */
  credits: number;
  /**
   * The analysis these lots belong to, for the link to each lot.
   *
   * The id rather than a function that builds the link. A function cannot
   * cross from a server component to a client one: there is nothing to send
   * over the wire, and Next refuses it at runtime rather than sending
   * something that would not work.
   */
  analysisId: string;
  /** The lots already on this analysis's shortlist, so a reload keeps them. */
  alreadyShortlisted: string[];
  caption?: string;
  pendingNote?: string;
};

export function FilteredLots({
  lots,
  initialFilters,
  credits,
  analysisId,
  alreadyShortlisted,
  caption,
  pendingNote,
}: FilteredLotsProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [shortlisted, setShortlisted] = useState<string[]>(alreadyShortlisted);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const change = (next: LotFilterState) => {
    setFilters(next);
    const query = paramsFromFilters(next).toString();
    // replace rather than push, so the back button leaves the catalogue
    // rather than walking back through every filter the reader tried.
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const save = async () => {
    setSaving(true);
    setSaved(null);
    const result = await analyseShortlist(analysisId, shortlisted);
    setSaving(false);

    if ('error' in result) {
      setSaved(result.error);
      return;
    }
    // An emptied shortlist is a saved choice too. Saying nothing would leave
    // the reader unsure whether unticking everything had worked.
    setSaved(
      result.saved === 0
        ? 'Your shortlist is empty. Nothing is being analysed.'
        : `Started. We are reading ${result.saved} ${result.saved === 1 ? 'lot' : 'lots'} from ${result.saved === 1 ? 'its' : 'their'} photographs. You can leave this page.`,
    );
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
        hrefFor={(lotId) => `/analysis/${analysisId}/lot/${lotId}`}
        caption={caption}
        pendingNote={pendingNote}
        selected={shortlisted}
        onSelect={(id, on) => {
          setSaved(null);
          setShortlisted((chosen) => (on ? [...chosen, id] : chosen.filter((each) => each !== id)));
        }}
      />
      {/* A lot the filters are hiding stays ticked. Narrowing the list is not
          changing your mind about a lot, and quietly unticking one would be
          us doing that for them. */}
      <CreditPreview
        selected={shortlisted.length}
        available={credits}
        onConfirm={save}
        confirming={saving}
        confirmingLabel="Starting"
        note={
          saved ??
          'Each lot is read from its own photographs, including any plates and labels, which is where a model number usually is. A credit is taken for each lot and given back for any we cannot read.'
        }
      />
    </>
  );
}
