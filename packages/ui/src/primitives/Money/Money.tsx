import { roundDownToDollar, roundToDollar } from '@maxbid/calc';

/**
 * UI04. Formats AUD with tabular figures.
 *
 * Rounding comes from decision record 0003 and is never done here. Bid
 * figures round down and are never rounded up, so a bid figure passes
 * rounding="down". Everything else rounds to the nearest dollar.
 */
export type MoneyProps = {
  amount: number;
  /** Bid figures round down. Every other figure rounds to the nearest dollar. */
  rounding?: 'nearest' | 'down';
  /** Cents belong in the calculator detail only, per the design system. */
  showCents?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  /** Exports replace the minus sign with parentheses. */
  forExport?: boolean;
  className?: string;
};

const SIZES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
  // 48px, the minimum for a bid figure in the phone bid view.
  hero: 'text-5xl',
} as const;

const AUD = (cents: boolean) =>
  new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });

export function formatMoney({
  amount,
  rounding = 'nearest',
  showCents = false,
  forExport = false,
}: Omit<MoneyProps, 'size' | 'className'>): string {
  const value = showCents
    ? amount
    : rounding === 'down'
      ? roundDownToDollar(amount)
      : roundToDollar(amount);
  const text = AUD(showCents).format(Math.abs(value));
  if (value >= 0) return text;
  return forExport ? `(${text})` : `-${text}`;
}

export function Money({ size = 'md', className = '', ...rest }: MoneyProps) {
  const negative = rest.amount < 0;
  const colour = negative ? 'text-zone-red' : '';
  return (
    <span className={`font-sans tabular-nums ${SIZES[size]} ${colour} ${className}`}>
      {formatMoney(rest)}
    </span>
  );
}
