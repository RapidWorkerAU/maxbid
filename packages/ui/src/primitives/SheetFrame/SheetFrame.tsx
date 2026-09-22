import type { ReactNode } from 'react';

/**
 * UI13. Detail B01. A navy panel carrying a double inset frame in line cyan,
 * like the border of a drawing sheet.
 *
 * The frame is decoration, so it is drawn with borders on wrapper elements
 * rather than announced to a screen reader.
 */
export type SheetFrameProps = {
  children: ReactNode;
  /** Padding between the outer and inner frame lines. */
  inset?: 'tight' | 'regular';
  className?: string;
};

const INSET = { tight: 'p-1.5', regular: 'p-2.5' } as const;

export function SheetFrame({ children, inset = 'regular', className = '' }: SheetFrameProps) {
  return (
    <div className={`bg-navy text-ink-on-navy ${INSET[inset]} ${className}`}>
      <div className="border border-border-on-navy p-px">
        <div className="border border-border-on-navy p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
