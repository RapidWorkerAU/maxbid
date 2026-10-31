// The two panels on the lot screen that carry the argument. UI49.
//
// Apart from LotDetail.tsx because between them they are most of the screen:
// the resale panel has to explain itself when it has no figure, and the
// evidence panel now carries the reader's own judgement about each sale. The
// section file is left as the order of the page.

import type { ReactNode } from 'react';
import { DetailCard } from '../../composites/DetailCard';
import { EvidenceRow, type Comparable } from '../../composites/EvidenceRow';
import { PriceLine } from '../../composites/PriceLine';
import { ConfidenceBadge } from '../../primitives/ConfidenceBadge';
import { InfoNote } from '../../primitives/InfoNote';
import { MonoLabel } from '../../primitives/MonoLabel';
import type { LotDetailValuation } from './types';

/**
 * What there is to say when we have no range.
 *
 * "We could not find enough comparable sales" read as "we found nothing" on a
 * lot where we had found four and they were below the weight the evidence
 * rule asks for. Those are different statements, and a reader who owns a 1998
 * Landcruiser knows perfectly well that sales of them exist. Saying how many
 * we found, and that they were not enough rather than not there, is the
 * difference between a limitation and a bug.
 */
export function whyNoRange(found: number): string {
  if (found === 0) {
    return 'We could not find any sales of this item to compare it against, so we cannot say what it resells for. A comparable is a sale of the same or a similar item that we use as evidence.';
  }
  const sales = found === 1 ? '1 possible comparable sale' : `${found} possible comparable sales`;
  return `We found ${sales}, which is not enough to put a resale figure on this lot. They are listed below with the weight each one carried. A sold price counts for more than an advertised one, a closer match counts for more than a rough one, and a recent price counts for more than an old one.`;
}

/** What we think it resells for, and how sure we are. */
export function Resale({ valuation, found }: { valuation: LotDetailValuation; found: number }) {
  const hasRange = valuation.conservative !== null && valuation.optimistic !== null;

  return (
    <DetailCard label="Resale" heading="What we think it resells for">
      {hasRange ? (
        <>
          <div className="space-y-3">
            <PriceLine
              label="Cautious"
              amount={valuation.conservative}
              note="The bid figures below are worked out from this end of the range, because the cautious end is the honest one to plan from."
            />
            <PriceLine label="Expected" amount={valuation.expected} />
            <PriceLine label="Optimistic" amount={valuation.optimistic} />
          </div>
          {valuation.confidence != null ? (
            <div className="mt-4 flex items-center gap-2">
              <MonoLabel>How sure we are</MonoLabel>
              <ConfidenceBadge score={valuation.confidence} showScore />
            </div>
          ) : null}
        </>
      ) : (
        <p className="font-sans text-sm text-ink-muted">{whyNoRange(found)}</p>
      )}
    </DetailCard>
  );
}

/** How many of the sales shown actually counted, which is not all of them. */
export function counted(comparables: Comparable[]): Comparable[] {
  return comparables.filter((c) => !c.excludedReason);
}

/** The sales the range was worked out from. F59, and the point of the screen. */
export function Evidence({
  comparables,
  exclusionFor,
  exclusionNote,
}: {
  comparables: Comparable[];
  exclusionFor?: (comparable: Comparable) => ReactNode;
  exclusionNote?: string;
}) {
  const aside = comparables.length - counted(comparables).length;

  return (
    <DetailCard label="Evidence" heading="The sales we worked from">
      {comparables.length > 0 ? (
        <>
          <p className="mb-3 font-sans text-sm text-ink-muted">
            Each sale below counted towards the range above. A sold price counts for more than an
            advertised price, a closer match counts for more than a rough one, and a recent price
            counts for more than an old one. The weight shows how much each one counted.
          </p>
          {/* Said before the list rather than after it, because a reader who
              set something aside is coming back to check that we did what
              they said. F62. */}
          {aside > 0 ? (
            <p className="mb-3 font-sans text-sm text-ink">
              You have set {aside === 1 ? '1 sale' : `${aside} sales`} aside. We worked the figures
              above out without {aside === 1 ? 'it' : 'them'}.
            </p>
          ) : null}
          {exclusionNote ? <InfoNote className="mb-3">{exclusionNote}</InfoNote> : null}
          <div>
            {comparables.map((comparable) => (
              <EvidenceRow
                key={comparable.id}
                comparable={comparable}
                action={exclusionFor?.(comparable)}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="font-sans text-sm text-ink-muted">
          We have not found any sales of this item to compare it against yet.
        </p>
      )}
    </DetailCard>
  );
}
