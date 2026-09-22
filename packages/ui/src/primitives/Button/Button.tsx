import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * UI01. Primary is marker yellow and is the main action on a screen.
 * B09 allows marker yellow only there and on the most you should bid figure.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-ink hover:brightness-105',
  secondary: 'bg-surface text-ink border border-ink hover:bg-surface-muted',
  ghost: 'bg-transparent text-ink hover:bg-surface-muted',
  danger: 'bg-zone-red text-ink-on-navy hover:brightness-110',
};

// min-h-11 is 44px, the minimum touch target in MF03 and the UI01 note.
const base =
  'relative inline-flex min-h-11 items-center justify-center rounded-sm px-5 font-sans text-base ' +
  'font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

type Common = {
  variant?: ButtonVariant;
  /** Shows the stop line loader, sets aria-busy and stops further presses. */
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * The stop line doubles as the loading motif, per the logo direction.
 * motion-safe holds the animation back when the reader asks for reduced
 * motion, which is what C08 requires.
 */
function LoadingBar() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-1 bg-ink/30 motion-safe:animate-pulse"
    />
  );
}

export function Button({
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  children,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${base} ${styles[variant]} ${className}`}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
      {loading ? <LoadingBar /> : null}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`${base} ${styles[variant]} ${className}`}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
      {loading ? <LoadingBar /> : null}
    </a>
  );
}
