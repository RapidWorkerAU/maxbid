import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-ink hover:brightness-105',
  secondary: 'bg-surface text-ink border border-ink hover:bg-surface-muted',
};

const base =
  'inline-flex min-h-11 items-center justify-center rounded-sm px-5 font-sans text-base font-bold ' +
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent';

type Common = { variant?: Variant; children: ReactNode };

export function Button({ variant = 'primary', className = '', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${base} ${styles[variant]} ${className}`} {...rest} />;
}

export function ButtonLink({ variant = 'primary', className = '', ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={`${base} ${styles[variant]} ${className}`} {...rest} />;
}
