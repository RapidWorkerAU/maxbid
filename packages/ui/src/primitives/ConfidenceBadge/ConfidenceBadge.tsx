/**
 * UI09. The confidence label and score from
 * docs/02-specs/matching-and-valuation.md.
 *
 * The band is worked out from the score here, in one place, so a badge can
 * never show a label that disagrees with its own number.
 */
export type ConfidenceLabel = 'high' | 'medium' | 'low' | 'insufficient';

export type ConfidenceBadgeProps = {
  /** 0 to 100. Leave it out when the minimum evidence was not met. */
  score?: number;
  /** Forces the band. Use only where the spec says insufficient regardless. */
  label?: ConfidenceLabel;
  /** Shows the score beside the label rather than only on hover. */
  showScore?: boolean;
  className?: string;
};

const BANDS: Record<ConfidenceLabel, { label: string; classes: string }> = {
  high: { label: 'High confidence', classes: 'bg-confidence-high text-ink-on-navy' },
  medium: { label: 'Medium confidence', classes: 'bg-confidence-medium text-ink-on-navy' },
  low: { label: 'Low confidence', classes: 'bg-confidence-low text-ink-on-navy' },
  insufficient: {
    label: 'Not enough evidence',
    classes: 'bg-surface-muted text-confidence-insufficient',
  },
};

/** High is 75 and above, medium 50 to 74, low 25 to 49, below that insufficient. */
export function bandForScore(score: number): ConfidenceLabel {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 25) return 'low';
  return 'insufficient';
}

export function ConfidenceBadge({
  score,
  label,
  showScore = false,
  className = '',
}: ConfidenceBadgeProps) {
  const band = label ?? (score === undefined ? 'insufficient' : bandForScore(score));
  const entry = BANDS[band];
  const hasScore = score !== undefined && band !== 'insufficient';
  return (
    <span
      title={hasScore ? `Confidence score ${score} out of 100` : undefined}
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 font-sans text-xs font-semibold ${entry.classes} ${className}`}
    >
      {entry.label}
      {hasScore && showScore ? (
        <span className="font-mono font-normal tabular-nums">{score}</span>
      ) : null}
    </span>
  );
}

export const CONFIDENCE_LABELS = Object.fromEntries(
  Object.entries(BANDS).map(([key, value]) => [key, value.label]),
) as Record<ConfidenceLabel, string>;
