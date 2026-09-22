import type { ReactNode } from 'react';

/**
 * UI11. The short contextual note that sits directly beneath the figure it
 * qualifies. PR01 sets the style: muted 12px text with an info icon, never a
 * page banner. PR02 makes warnings amber.
 *
 * The text always comes from packages/content. Never type a disclaimer here.
 */
export type InfoNoteProps = {
  /** A message from packages/content, such as DS02. */
  children: ReactNode;
  /** Warning is for DS05, DS06, DS07, DS15 and DS24, per PR02. */
  tone?: 'note' | 'warning';
  /** The full text, shown when the reader opens the note. */
  fullText?: string;
  className?: string;
};

const TONES = {
  note: 'text-ink-muted',
  warning: 'text-zone-amber',
} as const;

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="mt-px size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.25v4" strokeLinecap="round" />
      <path d="M8 4.75v.5" strokeLinecap="round" />
    </svg>
  );
}

export function InfoNote({ children, tone = 'note', fullText, className = '' }: InfoNoteProps) {
  const shape = `flex items-start gap-1.5 font-sans text-xs ${TONES[tone]} ${className}`;
  if (!fullText) {
    return (
      <p className={shape}>
        <InfoIcon />
        <span>{children}</span>
      </p>
    );
  }
  // details and summary means the full text opens without any client code.
  return (
    <details className={shape}>
      <summary className="flex cursor-pointer list-none items-start gap-1.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent">
        <InfoIcon />
        <span className="underline decoration-dotted underline-offset-2">{children}</span>
      </summary>
      <span className="mt-1 block ps-5">{fullText}</span>
    </details>
  );
}
