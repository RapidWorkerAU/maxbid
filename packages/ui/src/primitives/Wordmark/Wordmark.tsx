import { StopLine } from '../StopLine/StopLine';

/**
 * UI18. Always written MaxBid: capital M, capital B, one word. A marker
 * yellow stop line sits beneath Bid.
 *
 * The letters are hidden from screen readers and the whole mark carries one
 * accessible name, so it is read as a logo rather than as two words.
 */
export type WordmarkProps = {
  /** Use on navy panels, where the letters turn white. */
  onNavy?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZES = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
} as const;

export function Wordmark({ onNavy = false, size = 'md', className = '' }: WordmarkProps) {
  const colour = onNavy ? 'text-ink-on-navy' : 'text-ink';
  return (
    <span
      role="img"
      aria-label="MaxBid"
      className={`inline-flex items-end font-sans font-bold ${SIZES[size]} ${colour} ${className}`}
    >
      <span aria-hidden="true">Max</span>
      <span aria-hidden="true" className="flex flex-col leading-tight">
        Bid
        <StopLine />
      </span>
    </span>
  );
}
