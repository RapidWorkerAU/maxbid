/**
 * UI12. The marker yellow bar taken from the bid limit marker. It is the
 * brand mark, the active tab marker, the loading motif and the stop line on
 * a price rail.
 *
 * It is decorative by default. Give it a label only where it carries meaning
 * on its own, such as the stop line marking the break even bid.
 */
export type StopLineProps = {
  /** Accessible name. Without one the bar is hidden from screen readers. */
  label?: string;
  /** 4px by default. Use thick for the stop line on a price rail. */
  thickness?: 'thin' | 'regular' | 'thick';
  className?: string;
};

const THICKNESS = {
  thin: 'h-0.5',
  regular: 'h-1',
  thick: 'h-2',
} as const;

export function StopLine({ label, thickness = 'regular', className = '' }: StopLineProps) {
  const shape = `block w-full bg-accent ${THICKNESS[thickness]} ${className}`;
  if (!label) return <span aria-hidden="true" className={shape} />;
  return <span role="img" aria-label={label} className={shape} />;
}
