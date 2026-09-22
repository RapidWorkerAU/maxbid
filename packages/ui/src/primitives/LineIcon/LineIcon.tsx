/**
 * UI17. Detail B07. Simple 1.4px stroke icons in pen blue, for categories
 * and actions.
 *
 * Icons are decoration by default and carry no name, because the control
 * they sit in has the words. Give a label only where an icon stands alone.
 * The set grows as screens need it.
 */
export type LineIconName =
  | 'search'
  | 'download'
  | 'external'
  | 'check'
  | 'close'
  | 'chevronDown'
  | 'clock'
  | 'flag'
  | 'machinery'
  | 'vehicle'
  | 'tools'
  | 'electronics';

export type LineIconProps = {
  name: LineIconName;
  /** Accessible name. Without one the icon is hidden from screen readers. */
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZES = { sm: 'size-4', md: 'size-5', lg: 'size-6' } as const;

/** Paths are drawn on a 24 by 24 grid. */
const PATHS: Record<LineIconName, string> = {
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.5 15.5 20 20',
  download: 'M12 4v10m0 0 4-4m-4 4-4-4M4 18h16',
  external: 'M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  check: 'm4 12.5 5 5L20 6.5',
  close: 'M5 5l14 14M19 5 5 19',
  chevronDown: 'm5 9 7 7 7-7',
  clock: 'M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM12 8v4.5l3 2',
  flag: 'M5 4v16M5 5h13l-2.5 4L18 13H5',
  machinery: 'M3 17h10v-4H3ZM13 15h4l4-4v6h-8ZM6 17v2M10 17v2M17 17v2',
  vehicle: 'M3 14h18M5 14l2-5h10l2 5M5 14v4M19 14v4M7 18h2M15 18h2',
  tools: 'M4 20 14 10M14 10l-3-3 3-3 3 3ZM17 7l3 3-4 4-3-3',
  electronics: 'M5 5h14v10H5ZM9 19h6M12 15v4',
};

export function LineIcon({ name, label, size = 'md', className = '' }: LineIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 text-link ${SIZES[size]} ${className}`}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export const LINE_ICON_NAMES = Object.keys(PATHS) as LineIconName[];
