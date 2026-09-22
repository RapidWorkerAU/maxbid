import type { ReactNode } from 'react';

/**
 * UI15. Detail B03. The small navy tab that labels a card, the way views on
 * an engineering drawing are labelled DETAIL A or PLAN 01.
 *
 * It names the card it sits on, so it is real text rather than decoration.
 */
export type DetailLabelProps = {
  children: ReactNode;
  /** Navy tab on a light card, or a cyan outline on a navy panel. */
  tone?: 'navy' | 'onNavy';
  className?: string;
};

const TONES = {
  navy: 'bg-navy text-ink-on-navy',
  onNavy: 'border border-line text-line',
} as const;

export function DetailLabel({ children, tone = 'navy', className = '' }: DetailLabelProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 font-mono text-xs uppercase tracking-widest ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
