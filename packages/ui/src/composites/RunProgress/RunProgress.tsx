import { MonoLabel } from '../../primitives/MonoLabel';
import { StopLine } from '../../primitives/StopLine';

/**
 * UI57. How far through a run is, while it runs. SC04.
 *
 * A run that takes minutes and says nothing cannot be told from one that
 * failed. A sentence saying work has started is the same, because it never
 * changes: it says something began and leaves the reader to guess whether it
 * is still going, how much is left, or whether to wait.
 *
 * So this says what is done, what is still going and what we could not do,
 * and the bar moves as each one lands. Every number carries its own word,
 * because a row of bare figures makes the reader work out which is which.
 *
 * The bar is decoration. Everything it shows is in the words beside it, and
 * a reader who cannot see it loses nothing.
 */
export type RunProgressProps = {
  /** What is being worked through, such as "Reading lots from their photographs". */
  label: string;
  done: number;
  /** Still being worked on right now. */
  running: number;
  /** Tried and could not be done. */
  failed: number;
  total: number;
  /** What happens next, once it is finished. */
  note?: string;
  className?: string;
};

export function RunProgress({
  label,
  done,
  running,
  failed,
  total,
  note,
  className = '',
}: RunProgressProps) {
  if (total <= 0) return null;

  const settled = done + failed;
  const percent = Math.min(100, Math.round((settled / total) * 100));
  const finished = settled >= total;

  return (
    <section className={`border border-border bg-surface p-4 ${className}`} aria-label={label}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-sans font-semibold text-ink">{label}</p>
        <MonoLabel size="xs" tone="ink">
          {settled} of {total}
        </MonoLabel>
      </div>

      <div
        role="progressbar"
        aria-valuenow={settled}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
        className="mt-3 w-full bg-surface-muted"
      >
        {/* Never quite nothing, so a run that has just started still shows a
            mark. A bar at nought reads as nothing happening. */}
        <div style={{ width: `${Math.max(percent, 2)}%` }}>
          <StopLine thickness="thick" />
        </div>
      </div>

      <p className="mt-3 font-sans text-sm text-ink-muted" aria-live="polite">
        {finished
          ? failed === 0
            ? `Finished. We read ${done} ${done === 1 ? 'lot' : 'lots'}.`
            : `Finished. We read ${done} ${done === 1 ? 'lot' : 'lots'} and could not read ${failed}. You have not been charged for ${failed === 1 ? 'that one' : 'those'}.`
          : `${done} done, ${running} being read now, ${total - settled - running} to go.`}
      </p>

      {note && !finished ? <p className="mt-1 font-sans text-sm text-ink-muted">{note}</p> : null}
    </section>
  );
}
