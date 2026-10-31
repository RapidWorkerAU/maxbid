import type { ReactNode } from 'react';
import { MatchBadge, type MatchLevel } from '../../primitives/MatchBadge';
import { Money } from '../../primitives/Money';
import { MonoLabel } from '../../primitives/MonoLabel';

/**
 * UI22. One comparable sale, and how much it counted.
 *
 * This is the product. A resale range on its own is a number to be taken on
 * trust, and F59 says a figure the reader cannot check is not transparency.
 * So every comparable shows its price, what it was, how closely it matched,
 * how old it is and the weight that came out of those, which is what decision
 * record 0020 turns into the range.
 *
 * A comparable the reader can see is also a comparable they can disagree
 * with, which is the point: we show the evidence and they decide. F62 is that
 * disagreement made to count, and a comparable they set aside stays on the
 * row, marked, with their reason on it. Hiding it would leave the figures
 * changed and the reason for the change nowhere on the page.
 *
 * A card at 360px and a row from the medium breakpoint up, the same shape as
 * LotRow and for the same reason: five facts do not fit across a phone.
 *
 * Marker yellow appears nowhere here. B09 reserves it, and a comparable is
 * evidence rather than an action or a bid figure.
 */
export type Comparable = {
  id: string;
  /** What the listing or sale was called. */
  title: string;
  price: number;
  /** How closely it matches the lot, from the grading stage. */
  matchLevel: MatchLevel;
  /** The combined weight this comparable carried, 0 to 1. */
  weight: number;
  /** How old the price is, in days. */
  ageInDays: number;
  /** Where it came from, in words, such as "Grays auction result". */
  source: string;
  /** The listing, where we hold one. */
  url?: string | null;
  /** True where the price is what it sold for rather than what was asked. */
  sold?: boolean;
  /**
   * Why this counted as the same thing, in plain English. F21.
   *
   * Stored since the evidence tables were built and never shown. A match
   * level on its own is our verdict with the reasoning left out, which is
   * the opposite of what the evidence panel is for: the reader is deciding
   * whether to trust the range, and "near exact" tells them nothing they can
   * check.
   */
  reason?: string | null;
  /**
   * Why the reader set this one aside, where they did. F62.
   *
   * Their words, not ours. Set means this comparable counted for nothing in
   * the figures above.
   */
  excludedReason?: string | null;
};

export type EvidenceRowProps = {
  comparable: Comparable;
  /**
   * Setting this one aside, or putting it back. F62.
   *
   * Passed in rather than built here, because it writes to the database and
   * this package has no server in it.
   */
  action?: ReactNode;
  className?: string;
};

/** Days as something a person says, because 412 days is not a useful fact. */
export function ageInWords(days: number): string {
  if (days < 0) return 'Date unknown';
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 31) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 24) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  const years = Math.round(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

export function EvidenceRow({ comparable: c, action, className = '' }: EvidenceRowProps) {
  const setAside = Boolean(c.excludedReason);

  return (
    <div
      data-set-aside={setAside ? 'true' : undefined}
      className={`border-b border-border py-3 last:border-b-0 md:grid md:grid-cols-[minmax(0,1fr)_7rem_9rem_7rem] md:items-center md:gap-3 ${className}`}
    >
      <div className="min-w-0">
        {c.url ? (
          <a
            href={c.url}
            target="_blank"
            rel="noreferrer noopener"
            className="block truncate font-sans text-base text-link underline md:text-sm"
            title={c.title}
          >
            {c.title}
          </a>
        ) : (
          <p className="truncate font-sans text-base text-ink md:text-sm" title={c.title}>
            {c.title}
          </p>
        )}
        <p className="mt-0.5 font-sans text-sm text-ink-muted md:text-xs">
          {/* Said in words, because "sold" and "asking" change what a price
              means and decision record 0020 weights them very differently. */}
          {c.sold ? 'Sold price' : 'Asking price'} from {c.source}
        </p>
      </div>

      <div className="mt-2 md:mt-0">
        <Money amount={c.price} />
      </div>

      <div className="mt-2 md:mt-0">
        {/* A weight of nothing, said as words as well as a figure, because a
            set aside comparable did not count towards anything above. Design
            rule 4: a status always carries a text label. */}
        {setAside ? (
          <MonoLabel>Set aside</MonoLabel>
        ) : (
          <MatchBadge level={c.matchLevel} weight={c.weight} />
        )}
      </div>

      <div className="mt-2 md:mt-0">
        <MonoLabel>{ageInWords(c.ageInDays)}</MonoLabel>
      </div>

      {/* Why it counted, under the row rather than in a column, because it is
          a sentence and the four columns above are all one line each. F21.

          Full width on a desktop so it is not squeezed into the title's
          share. This is the part a reader uses to disagree with us: a match
          level on its own is a verdict with the reasoning left out. */}
      {c.reason && !setAside ? (
        <p className="mt-2 font-sans text-sm text-ink-muted md:col-span-4 md:mt-1 md:text-xs">
          {c.reason}
        </p>
      ) : null}

      {setAside ? (
        <p className="mt-2 font-sans text-sm text-ink md:col-span-4 md:mt-1 md:text-xs">
          You set this one aside and said: {c.excludedReason}. It counted for nothing in the figures
          above.
        </p>
      ) : null}

      {action ? <div className="mt-2 md:col-span-4 md:mt-1">{action}</div> : null}
    </div>
  );
}
