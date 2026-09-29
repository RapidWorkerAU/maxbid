import { ConfidenceBadge } from '../../primitives/ConfidenceBadge';
import { Money } from '../../primitives/Money';
import { MonoLabel } from '../../primitives/MonoLabel';

/**
 * UI33. One lot in a triage list.
 *
 * SC05 calls for a dense table, and a table is the right thing on a desktop
 * where a reseller compares a hundred lots at once. It is the wrong thing at
 * 360px, where six columns stop being readable. So this is a card on a phone
 * and a table row from the medium breakpoint up.
 *
 * A 36px row holds one line of text. The first version of this stacked the
 * title and the identification inside one, which wrapped the lot number onto
 * two lines, cut the title off at full desktop width and let the second line
 * overlap the row below. Every cell here is a single line, and anything too
 * long is truncated with its full text on hover. The phone card is the place
 * where things stack, because a card has the height for it.
 *
 * Blueprint details. Rows are 36px standard and 44px comfortable through the
 * spacing tokens, which is the density switch C09 asks for. Desktop table text
 * is 15px and mobile is 16px. Lot numbers are Space Mono with tabular figures.
 * Hairline borders and 2px corners, never shadows, per B08. Marker yellow
 * appears nowhere, because B09 reserves it for the main action and the most
 * you should bid figure, and this row carries neither.
 */
export type LotRowLot = {
  id: string;
  /** The auction's own lot number, such as 0004-23502418. */
  lotNumber: string;
  title: string;
  currentBid?: number | null;
  closesAt?: string | null;
  /** What triage decided the lot is. */
  identifiedAs?: string | null;
  /** 0 to 100, from the identification. */
  confidence?: number | null;
  /** Anything the catalogue said about condition, such as a write off marker. */
  conditionNote?: string | null;
  /** The rough resale range from triage. Both or neither. */
  resaleLow?: number | null;
  resaleHigh?: number | null;
};

export type LotRowProps = {
  lot: LotRowLot;
  /** C09. Standard is 36px, comfortable is 44px. */
  density?: 'standard' | 'comfortable';
  /** Shown when the list lets the user shortlist lots. */
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  className?: string;
};

/**
 * The columns, shared with the heading row so the two line up exactly.
 *
 * The lot number column is wide enough for 0001-23502418 in Space Mono
 * without wrapping, which the first version was not. The two flexible columns
 * share what is left, with the item given the larger share because a
 * catalogue title is the longest thing on the row.
 */
export const LOT_COLUMNS =
  'md:grid-cols-[1.75rem_8.5rem_minmax(0,2fr)_minmax(0,1.2fr)_6.5rem_9.5rem_8.5rem_7.5rem]';

const ROW_HEIGHT = {
  standard: 'md:h-row',
  comfortable: 'md:h-row-comfortable',
} as const;

/** How long until a lot closes, in words. Never a bare timestamp. */
export function closesIn(closesAt: string, now: Date = new Date()): string {
  const ms = new Date(closesAt).getTime() - now.getTime();
  if (Number.isNaN(ms)) return '';
  if (ms <= 0) return 'Closed';

  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) return `Closes in ${days} ${days === 1 ? 'day' : 'days'}`;
  if (hours >= 1) return `Closes in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `Closes in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

function Checkbox({ lot, selected, onSelect }: LotRowProps) {
  // The cell is always here, empty when the list does not shortlist, so the
  // columns line up with the heading row either way.
  if (!onSelect) return <span className="hidden md:block" aria-hidden />;
  return (
    <input
      type="checkbox"
      checked={selected ?? false}
      onChange={(event) => onSelect(lot.id, event.target.checked)}
      // The lot number alone would read as a string of digits, so the label
      // names what is being chosen.
      aria-label={`Shortlist lot ${lot.lotNumber}, ${lot.title}`}
      className="size-4 shrink-0 rounded-sm accent-marker"
    />
  );
}

function Condition({ note }: { note?: string | null }) {
  if (!note) return null;
  // A written off marker is a fact about the lot, not our judgement of it, so
  // it is a bordered tag rather than a zone colour. The zone colours mean go,
  // caution and stop on a bid figure, and one here would say we had decided
  // something we have not. Space Mono, because it is a code, not a sentence.
  return (
    <span className="shrink-0 whitespace-nowrap rounded-sm border border-zone-amber px-1 py-px font-mono text-[0.625rem] uppercase leading-tight text-zone-amber">
      {note}
    </span>
  );
}

export function LotRow({
  lot,
  density = 'standard',
  selected,
  onSelect,
  className = '',
}: LotRowProps) {
  const closing = lot.closesAt ? closesIn(lot.closesAt) : null;

  return (
    <div
      className={`grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 border-b border-line/40 px-3 py-2.5 text-base last:border-b-0 md:gap-y-0 md:py-0 md:text-[0.9375rem] ${LOT_COLUMNS} ${ROW_HEIGHT[density]} ${className}`}
    >
      <Checkbox lot={lot} selected={selected} onSelect={onSelect} />

      {/* Lot number. One line, never wrapped: it is an identifier, and half
          of one is no use to anybody. */}
      <MonoLabel size="xs" className="whitespace-nowrap tabular-nums">
        {lot.lotNumber}
      </MonoLabel>

      {/* Item. The longest thing on the row, so it gets the largest share and
          truncates rather than pushing everything else out of line. */}
      <div className="col-start-2 flex min-w-0 items-center gap-2 md:col-start-auto">
        <span className="truncate font-sans font-semibold text-ink" title={lot.title}>
          {lot.title}
        </span>
        <Condition note={lot.conditionNote} />
      </div>

      {/* What we decided it is. Its own column on a desktop, so it can never
          sit on top of the row below. */}
      <div className="col-start-2 min-w-0 md:col-start-auto">
        {lot.identifiedAs ? (
          <span
            className="block truncate font-sans text-sm text-ink-muted"
            title={lot.identifiedAs}
          >
            {lot.identifiedAs}
          </span>
        ) : (
          <span className="font-sans text-xs text-ink-muted md:hidden">Not identified yet</span>
        )}
      </div>

      <div className="col-start-2 md:col-start-auto md:text-right">
        {lot.currentBid === null || lot.currentBid === undefined ? (
          <span className="whitespace-nowrap font-sans text-xs text-ink-muted">No bid yet</span>
        ) : (
          <>
            <span className="font-sans text-xs text-ink-muted md:hidden">Current bid </span>
            <Money amount={lot.currentBid} size="sm" />
          </>
        )}
      </div>

      {/* What we think it is worth. A lot without enough evidence says so
          rather than showing a blank, which would read as a figure nobody
          bothered to fill in. */}
      <div className="col-start-2 md:col-start-auto md:text-right">
        {lot.resaleLow != null && lot.resaleHigh != null ? (
          <span className="whitespace-nowrap font-mono text-sm tabular-nums text-ink">
            <Money amount={lot.resaleLow} size="sm" />
            {' to '}
            <Money amount={lot.resaleHigh} size="sm" />
          </span>
        ) : (
          <span className="whitespace-nowrap font-sans text-xs text-ink-muted">
            Not enough evidence
          </span>
        )}
      </div>

      <div className="col-start-2 md:col-start-auto md:justify-self-end">
        {lot.confidence === null || lot.confidence === undefined ? null : (
          <ConfidenceBadge score={lot.confidence} />
        )}
      </div>

      <div className="col-start-2 md:col-start-auto md:text-right">
        {closing ? (
          <span className="whitespace-nowrap font-sans text-xs text-ink-muted">{closing}</span>
        ) : null}
      </div>
    </div>
  );
}
