import type { ReactNode } from 'react';
import { DetailLabel } from '../../primitives/DetailLabel';

/**
 * UI26. A framed card with a label on it, the way a view on an engineering
 * drawing is labelled DETAIL A.
 *
 * The lot detail screen is a stack of these: what the lot is, what it is
 * worth, what the evidence was, what it costs. Each one answers one question,
 * and the label says which question before the reader has to work it out.
 *
 * Blueprint details. Hairline border and 2px corners, never a shadow, per B08.
 * The label sits on the top edge rather than inside, so the card reads as a
 * drawing sheet rather than as a panel with a heading.
 *
 * The heading level is a prop because this says nothing about where it sits.
 * A card used as the only section of a page and a card used as the fourth of
 * six need different levels, and a wrong one is an accessibility failure the
 * axe gate will not catch.
 */
export type DetailCardProps = {
  /** The short label on the card edge, such as IDENTIFICATION. */
  label: string;
  /** The card's own heading. Omit where the label is enough. */
  heading?: string;
  as?: 'h2' | 'h3' | 'h4';
  children: ReactNode;
  className?: string;
};

export function DetailCard({
  label,
  heading,
  as: Heading = 'h2',
  children,
  className = '',
}: DetailCardProps) {
  return (
    <section
      className={`relative border border-border bg-surface p-4 pt-5 sm:p-6 sm:pt-7 ${className}`}
    >
      {/* Sits on the edge, so the border appears to pass behind it. */}
      <span className="absolute -top-2 left-4">
        <DetailLabel>{label}</DetailLabel>
      </span>
      {heading ? (
        <Heading className="mb-3 font-sans text-lg font-semibold text-ink">{heading}</Heading>
      ) : null}
      {children}
    </section>
  );
}
