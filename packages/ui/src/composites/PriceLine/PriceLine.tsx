import type { ReactNode } from 'react';
import { LeaderLine } from '../../primitives/LeaderLine';
import { Money } from '../../primitives/Money';

/**
 * UI23. A named money figure on a leader line, with the sentence that says
 * what it is.
 *
 * Used for a cost line, an end of a resale range and a bid figure. LeaderLine
 * draws the row and the dotted leader, which is Blueprint detail B05. This
 * adds the three things a figure on this product needs: formatting that obeys
 * the rounding rules, a note saying what the figure is, and a statement
 * rather than a blank when there is no figure at all.
 *
 * Marker yellow is a prop rather than something this works out. B09 reserves
 * it for the main action and the most you should bid figure, and a component
 * that decided for itself would sooner or later put it on a cost line.
 *
 * There is deliberately no description list mode. This always wraps its row so
 * the note has somewhere to sit, which means a dt and dd inside it could never
 * be direct children of a dl, and axe is right to reject that. A caller who
 * wants a real description list uses LeaderLine directly, which has no note.
 */
export type PriceLineProps = {
  label: string;
  amount: number | null;
  /** A sentence explaining what the figure is. WR03 and WR05. */
  note?: ReactNode;
  /** Bid figures round down and are never rounded up. Decision record 0003. */
  rounding?: 'nearest' | 'down';
  /** Cents belong in the calculator detail only. */
  showCents?: boolean;
  /** True only for the most you should bid figure. B09. */
  emphasis?: boolean;
  /** What to say in place of the figure when there is none. */
  emptyText?: string;
  className?: string;
};

export function PriceLine({
  label,
  amount,
  note,
  rounding = 'nearest',
  showCents = false,
  emphasis = false,
  emptyText = 'Not worked out',
  className = '',
}: PriceLineProps) {
  return (
    <div className={className}>
      <LeaderLine label={label} strong={emphasis}>
        {amount === null ? (
          // A blank would read as a figure of nothing. That we have not worked
          // it out is a different statement from a value of zero, and F26 says
          // a lot without enough evidence shows no figure at all.
          <span className="font-mono text-ink-muted">{emptyText}</span>
        ) : (
          <span className={emphasis ? 'bg-accent px-1.5 py-0.5 text-ink' : undefined}>
            <Money amount={amount} rounding={rounding} showCents={showCents} />
          </span>
        )}
      </LeaderLine>
      {note ? <p className="mt-1 font-sans text-sm text-ink-muted">{note}</p> : null}
    </div>
  );
}
