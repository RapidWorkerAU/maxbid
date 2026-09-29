import { ConfidenceBadge } from '../../primitives/ConfidenceBadge';
import { Money } from '../../primitives/Money';
import { MonoLabel } from '../../primitives/MonoLabel';

/**
 * UI33. One lot in a triage list.
 *
 * SC05 calls for a dense table, and a table is the right thing on a desktop
 * where a reseller compares a hundred lots at once. It is the wrong thing at
 * 360px, where six columns become unreadable. So this renders as a card on a
 * phone and as a table row from the medium breakpoint up, which is the same
 * information either way rather than a cut down version of it.
 *
 * Figures the pipeline has not produced yet are left out rather than shown
 * empty or filled with a placeholder. A blank where a resale range belongs is
 * a question; a zero is a wrong answer.
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
};

export type LotRowProps = {
  lot: LotRowLot;
  /** Shown when the list lets the user shortlist lots. */
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  className?: string;
};

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
  if (!onSelect) return null;
  return (
    <input
      type="checkbox"
      checked={selected ?? false}
      onChange={(event) => onSelect(lot.id, event.target.checked)}
      // The lot number alone would read as a string of digits, so the label
      // names what is being chosen.
      aria-label={`Shortlist lot ${lot.lotNumber}, ${lot.title}`}
      className="size-5 shrink-0 accent-marker"
    />
  );
}

function Condition({ note }: { note?: string | null }) {
  if (!note) return null;
  // A written off marker is a fact about the lot, not our judgement of it, so
  // it is drawn as a bordered tag rather than in a zone colour. The zone
  // colours mean go, caution and stop on a bid figure, and using one here
  // would say we had decided something we have not.
  return (
    <span className="inline-block rounded-sm border border-zone-amber px-1.5 py-0.5 font-sans text-xs font-semibold text-zone-amber">
      {note}
    </span>
  );
}

export function LotRow({ lot, selected, onSelect, className = '' }: LotRowProps) {
  const closing = lot.closesAt ? closesIn(lot.closesAt) : null;

  return (
    <div
      className={`grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 border-b border-line px-3 py-3 md:grid-cols-[auto_7rem_1fr_8rem_9rem] md:items-center md:gap-y-0 md:py-2 ${className}`}
    >
      <Checkbox lot={lot} selected={selected} onSelect={onSelect} />

      <MonoLabel className="md:text-ink-muted">{lot.lotNumber}</MonoLabel>

      <div className="col-start-2 md:col-start-auto">
        <p className="font-sans text-sm font-semibold text-ink">{lot.title}</p>
        {lot.identifiedAs ? (
          <p className="mt-0.5 font-sans text-xs text-ink-muted">{lot.identifiedAs}</p>
        ) : null}
        {lot.conditionNote ? (
          <p className="mt-1">
            <Condition note={lot.conditionNote} />
          </p>
        ) : null}
      </div>

      <div className="col-start-2 md:col-start-auto md:text-right">
        {lot.currentBid === null || lot.currentBid === undefined ? (
          <span className="font-sans text-xs text-ink-muted">No bid yet</span>
        ) : (
          <>
            <span className="font-sans text-xs text-ink-muted md:hidden">Current bid </span>
            <Money amount={lot.currentBid} size="sm" />
          </>
        )}
      </div>

      <div className="col-start-2 flex flex-wrap items-center gap-2 md:col-start-auto md:justify-end">
        {lot.confidence === null || lot.confidence === undefined ? null : (
          <ConfidenceBadge score={lot.confidence} />
        )}
        {closing ? (
          <span className="font-sans text-xs text-ink-muted">{closing}</span>
        ) : null}
      </div>
    </div>
  );
}
