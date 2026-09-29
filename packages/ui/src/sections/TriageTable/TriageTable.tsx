import { LOT_COLUMNS, LotRow, type LotRowLot } from '../../composites/LotRow';
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
 * advice. The note at the top says what is missing.
 *
 * Blueprint details that apply here. The header sits on surface_muted and
 * sticks while the list scrolls, per the density and stickiness rules. Column
 * headings are uppercase Space Mono, per B04. The frame is a hairline with
 * 2px corners rather than a shadow, per B08.
 */
export type TriageTableProps = {
  lots: LotRowLot[];
  /** C09. Standard is 36px rows, comfortable is 44px. */
  density?: 'standard' | 'comfortable';
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
    <div className="rounded-sm border border-line/60 px-4 py-10 text-center">
      <p className="font-sans font-semibold text-ink">No lots yet</p>
      <p className="mx-auto mt-1 max-w-sm font-sans text-sm text-ink-muted">
        We have not read any lots from this catalogue. If the analysis is still
        running, this page fills in as it goes.
      </p>
    </div>
  );
}

/** The column headings. Hidden on a phone, where each row is a card. */
function Headings() {
  return (
    <div
      className={`sticky top-0 z-10 hidden h-row items-center border-b border-line bg-surface-muted px-3 md:grid md:gap-x-3 ${LOT_COLUMNS}`}
    >
      {/* The empty cell above the checkbox column, so the headings sit over
          the right cells whether the list shortlists or not. */}
      <span aria-hidden />
      <MonoLabel size="xs" tone="ink">Lot</MonoLabel>
      <MonoLabel size="xs" tone="ink">Item</MonoLabel>
      <MonoLabel size="xs" tone="ink">Identified as</MonoLabel>
      <MonoLabel size="xs" tone="ink" className="text-right">Current bid</MonoLabel>
      <MonoLabel size="xs" tone="ink" className="justify-self-end">Confidence</MonoLabel>
      <MonoLabel size="xs" tone="ink" className="text-right">Closes</MonoLabel>
    </div>
  );
}

export function TriageTable({
  lots,
  density = 'standard',
  selected = [],
  onSelect,
  caption,
  pendingNote,
  className = '',
}: TriageTableProps) {
  if (lots.length === 0) return <Empty />;

  const chosen = new Set(selected);
  const shortlisting = Boolean(onSelect);

  // A div rather than a section. A section with a name is a landmark, and a
  // landmark is for a page level region such as navigation or main. A list of
  // lots is content, and two of them on one page are indistinguishable to a
  // screen reader, which is what the accessibility check objected to. The
  // heading is what a screen reader user navigates by here.
  return (
    <div className={className}>
      {/*
        A div, not a header. A header outside a sectioning element is the
        page banner landmark, so two tables on one page gave a document two
        banners. This is a caption row, not the top of the page.
      */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {caption ? (
          <h2 className="font-sans text-lg font-bold text-ink">{caption}</h2>
        ) : null}
        <p className="font-mono text-xs uppercase tracking-wide text-ink-muted tabular-nums">
          {lots.length} {lots.length === 1 ? 'lot' : 'lots'}
          {shortlisting && chosen.size > 0 ? ` · ${chosen.size} shortlisted` : ''}
        </p>
      </div>

      {pendingNote ? <InfoNote className="mt-3">{pendingNote}</InfoNote> : null}

      {/* A hairline frame with 2px corners, per B08. No shadow. */}
      <div className="mt-3 overflow-hidden rounded-sm border border-line/60">
        <Headings />
        {lots.map((lot) => (
          <LotRow
            key={lot.id}
            lot={lot}
            density={density}
            selected={chosen.has(lot.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
