import { shortlistCost } from '@maxbid/calc';
import { Button } from '../../primitives/Button';
import { MonoLabel } from '../../primitives/MonoLabel';

/**
 * UI56. What a shortlist will cost, before it is confirmed. F17.
 *
 * One credit is one deep analysed lot. The figure is shown before confirming
 * rather than after, because a charge somebody did not see coming is a charge
 * they did not agree to, and F17 says the user cannot exceed the credits they
 * have.
 *
 * Every number says what it is and the sentence says what will happen, as the
 * writing rules require. Marker yellow is on the confirm button, which is the
 * main action on this bar and the only thing B09 allows it on here.
 *
 * It states the cost and lets the reader decide. It does not say a shortlist
 * is too big, or suggest which lots to drop.
 */
export type CreditPreviewProps = {
  /** How many lots are ticked. */
  selected: number;
  /** Credits the organisation has left. */
  available: number;
  onConfirm?: () => void;
  /** What the button says. The default promises a deep analysis. */
  confirmLabel?: string;
  /** What the button says while it is working. */
  confirmingLabel?: string;
  /**
   * What confirming will actually do, where that is not what it sounds like.
   *
   * Deep analysis is Week 5 and is not built, so today the button saves a
   * shortlist and spends nothing. A bar that said "Analyse these lots" and
   * then did not would be worse than one that says what it can.
   */
  note?: string;
  /** True while the shortlist is being sent, so it cannot be sent twice. */
  confirming?: boolean;
  className?: string;
};

export function CreditPreview({
  selected,
  available,
  onConfirm,
  confirmLabel,
  confirmingLabel = 'Starting',
  note,
  confirming = false,
  className = '',
}: CreditPreviewProps) {
  const cost = shortlistCost(selected, available);

  // Nothing ticked is nothing to say. A bar that appears before the reader
  // has done anything is a bar they learn to ignore.
  if (cost.lots === 0) return null;

  const credits = (count: number) => `${count} ${count === 1 ? 'credit' : 'credits'}`;

  return (
    <div
      className={`sticky bottom-0 z-20 border-t border-border bg-surface px-4 py-3 ${className}`}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <MonoLabel size="xs" tone="ink">
            Shortlist
          </MonoLabel>
          <p className="mt-1 font-sans text-base text-ink">
            {cost.lots} {cost.lots === 1 ? 'lot' : 'lots'} ticked, which costs{' '}
            <strong className="font-semibold">{credits(cost.credits)}</strong>. A credit pays for
            one lot to be analysed in full.
          </p>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            {cost.affordable
              ? `You have ${credits(cost.available)} and would have ${credits(cost.remaining)} left.`
              : `You have ${credits(cost.available)}, so you need ${credits(cost.shortfall)} more before you can analyse these.`}
          </p>
          {note ? <p className="mt-1 font-sans text-sm text-ink-muted">{note}</p> : null}
        </div>

        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={!cost.affordable || confirming || !onConfirm}
        >
          {confirming
            ? confirmingLabel
            : (confirmLabel ?? `Analyse ${cost.lots === 1 ? 'this lot' : 'these lots'}`)}
        </Button>
      </div>
    </div>
  );
}
