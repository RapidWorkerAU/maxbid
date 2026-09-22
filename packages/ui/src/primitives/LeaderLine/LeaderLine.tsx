import type { ReactNode } from 'react';

/**
 * UI16. Detail B05. A label, a dotted leader and a figure on one line, the
 * way a drawing connects a note to the thing it describes.
 *
 * Used for cost lists and side panels. The dotted leader is decoration, so a
 * screen reader hears only the label and the figure.
 */
export type LeaderLineProps = {
  label: ReactNode;
  children: ReactNode;
  /** Renders as a row inside a description list, for cost lines. */
  inList?: boolean;
  /** Emphasises a total. */
  strong?: boolean;
  className?: string;
};

export function LeaderLine({
  label,
  children,
  inList = false,
  strong = false,
  className = '',
}: LeaderLineProps) {
  const weight = strong ? 'font-semibold text-ink' : 'text-ink-muted';
  const Label = inList ? 'dt' : 'span';
  const Value = inList ? 'dd' : 'span';
  return (
    <div className={`flex items-baseline gap-2 font-sans text-sm ${className}`}>
      <Label className={`shrink-0 ${weight}`}>{label}</Label>
      <span aria-hidden="true" className="min-w-4 flex-1 border-b border-dotted border-border" />
      <Value className={`shrink-0 tabular-nums ${strong ? 'font-semibold text-ink' : 'text-ink'}`}>
        {children}
      </Value>
    </div>
  );
}
