import { LotRow, type LotRowLot } from '../../composites/LotRow';
import { InfoNote } from '../../primitives/InfoNote';
import { MonoLabel } from '../../primitives/MonoLabel';

/**
 * UI48. Every lot in a catalogue, ranked. SC05.
 *
 * SC05 also calls for an opportunity score, a rough resale range and a rough
 * maximum bid. None of those exist yet: they come from stages S5 and S6 and
 * from a cost profile. They are left out rather than shown as empty columns,
 * because a blank where a resale range belongs invites the reader to supply
 * their own answer, and a placeholder figure next to a bid would be read as
 * advice.
 *
 * The table says plainly what it does not yet know, which is what the note at
 * the top is for.
 */
export type TriageTableProps = {
  lots: LotRowLot[];
  /** The ids the user has shortlisted. */
  selected?: string[];
  onSelect?: (id: string, selected: boolean) => void;
  /** Shown above the table, such as the name of the sale. */
  caption?: string;
  /** A sentence about what is not here yet. Leave it out once it all is. */
  pendingNote?: string;
  className?: string;
};

function Empty() {
  return (
    <div className="border border-line px-4 py-8 text-center">
      <p className="font-sans font-semibold text-ink">No lots yet</p>
      <p className="mt-1 font-sans text-sm text-ink-muted">
        We have not read any lots from this catalogue. If the analysis is still
        running, this page fills in as it goes.
      </p>
    </div>
  );
}

/** The column headings, shown from the medium breakpoint up. */
function Headings({ shortlisting }: { shortlisting: boolean }) {
  return (
    <div className="hidden border-b border-line px-3 py-2 md:grid md:grid-cols-[auto_7rem_1fr_8rem_9rem] md:items-center md:gap-x-3">
      {shortlisting ? <span className="size-5" aria-hidden /> : null}
      <MonoLabel>Lot</MonoLabel>
      <MonoLabel>Item</MonoLabel>
      <MonoLabel className="text-right">Current bid</MonoLabel>
      <MonoLabel className="text-right">Identified</MonoLabel>
    </div>
  );
}

export function TriageTable({
  lots,
  selected = [],
  onSelect,
  caption,
  pendingNote,
  className = '',
}: TriageTableProps) {
  if (lots.length === 0) return <Empty />;

  const chosen = new Set(selected);
  const shortlisting = Boolean(onSelect);

  return (
    <section className={className} aria-label={caption ?? 'Lots in this catalogue'}>
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        {caption ? <h2 className="font-sans text-lg font-bold text-ink">{caption}</h2> : null}
        <p className="font-sans text-sm text-ink-muted">
          {lots.length} {lots.length === 1 ? 'lot' : 'lots'}
          {shortlisting && chosen.size > 0 ? `, ${chosen.size} shortlisted` : ''}
        </p>
      </header>

      {pendingNote ? <InfoNote className="mt-3">{pendingNote}</InfoNote> : null}

      <div className="mt-3 border-t border-line md:border-t-0">
        <Headings shortlisting={shortlisting} />
        {lots.map((lot) => (
          <LotRow
            key={lot.id}
            lot={lot}
            selected={chosen.has(lot.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
