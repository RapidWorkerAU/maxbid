/**
 * UI08. The six match levels from docs/02-specs/matching-and-valuation.md.
 *
 * The design system asks for a pill with an icon and text, with exact and
 * near exact solid, specification and alternative outlined, and insufficient
 * grey. The icon is decorative: the text carries the meaning, so colour and
 * shape are never the only signal.
 */
export type MatchLevel =
  | 'exact'
  | 'nearExact'
  | 'higherSpec'
  | 'lowerSpec'
  | 'similarAlternative'
  | 'insufficient';

export type MatchBadgeProps = {
  level: MatchLevel;
  /** Shows the match weight, such as 0.85, for the evidence panel. */
  weight?: number;
  className?: string;
};

type Entry = { label: string; classes: string; glyph: 'solid' | 'part' | 'open' | 'none' };

const LEVELS: Record<MatchLevel, Entry> = {
  exact: { label: 'Exact', classes: 'bg-ink text-ink-on-navy', glyph: 'solid' },
  nearExact: { label: 'Near exact', classes: 'bg-ink-muted text-ink-on-navy', glyph: 'part' },
  higherSpec: {
    label: 'Higher specification',
    classes: 'border border-ink text-ink',
    glyph: 'open',
  },
  lowerSpec: {
    label: 'Lower specification',
    classes: 'border border-ink text-ink',
    glyph: 'open',
  },
  similarAlternative: {
    label: 'Similar alternative',
    classes: 'border border-border text-ink-muted',
    glyph: 'open',
  },
  insufficient: {
    label: 'Insufficient evidence',
    classes: 'bg-surface-muted text-confidence-insufficient',
    glyph: 'none',
  },
};

/** A filled, half filled or empty square, echoing the drawing sheet details. */
function Glyph({ shape }: { shape: Entry['glyph'] }) {
  if (shape === 'none') return null;
  const fill = shape === 'solid' ? 'bg-current' : shape === 'part' ? 'bg-current/50' : '';
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-2 rounded-[1px] border border-current ${fill}`}
    />
  );
}

export function MatchBadge({ level, weight, className = '' }: MatchBadgeProps) {
  const entry = LEVELS[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 font-sans text-xs font-semibold ${entry.classes} ${className}`}
    >
      <Glyph shape={entry.glyph} />
      {entry.label}
      {weight === undefined ? null : (
        <span className="font-mono font-normal tabular-nums">{weight.toFixed(2)}</span>
      )}
    </span>
  );
}

export const MATCH_LABELS = Object.fromEntries(
  Object.entries(LEVELS).map(([key, value]) => [key, value.label]),
) as Record<MatchLevel, string>;
