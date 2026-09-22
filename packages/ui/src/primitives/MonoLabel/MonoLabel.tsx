import type { ReactNode } from 'react';

/**
 * UI05. The small uppercase Space Mono label that sits above a figure, such
 * as MOST YOU SHOULD BID. Detail B04.
 *
 * WR11 allows these only as labels on figures, never as sentences.
 */
export type MonoLabelProps = {
  children: ReactNode;
  /** Muted is the default. Use onNavy inside a navy panel. */
  tone?: 'muted' | 'ink' | 'onNavy';
  size?: 'xs' | 'sm';
  className?: string;
};

const TONES = {
  muted: 'text-ink-muted',
  ink: 'text-ink',
  onNavy: 'text-line',
} as const;

const SIZES = { xs: 'text-[0.6875rem]', sm: 'text-xs' } as const;

export function MonoLabel({
  children,
  tone = 'muted',
  size = 'sm',
  className = '',
}: MonoLabelProps) {
  return (
    <span
      className={`block font-mono uppercase tracking-widest ${SIZES[size]} ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
