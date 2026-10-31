import type { ReactNode } from 'react';
import { BidLimits } from '../../composites/BidLimits';
import { DetailCard } from '../../composites/DetailCard';
import { PriceLine } from '../../composites/PriceLine';
import { ConfidenceBadge } from '../../primitives/ConfidenceBadge';
import { InfoNote } from '../../primitives/InfoNote';
import { SheetFrame } from '../../primitives/SheetFrame';
import { formatMoney } from '../../primitives/Money';
import { TitleBlock } from '../../primitives/TitleBlock';
import { counted, Evidence, Resale } from './panels';
import type { LotDetailLot, LotDetailProps } from './types';

export type { LotDetailLot, LotDetailProps, LotDetailValuation } from './types';

/** A figure inside a sentence, formatted the way every other figure is. */
const money = (amount: number) => formatMoney({ amount });

/**
 * UI49. One lot, and everything we know about it. SC06.
 *
 * The order on the page is the order of the argument: what the lot is, what
 * it is bid to now, what we think it resells for, the evidence that produced
 * that, and only then the bid figures that follow from it. A reader who stops
 * halfway has still seen the reasoning behind the figure they skipped to.
 *
 * Everything here is a statement about the lot or about the reader's own
 * figures. Nothing says to bid or not to bid: we show the research, the
 * current bid and what their profit target implies, and they decide. That is
 * also why the evidence is on the page rather than behind a link.
 *
 * Read only for now. Confirming an identification, editing cost lines and the
 * bid slider are UI20, UI25 and the calculator panel, which come next.
 */
/** What we decided the lot is, or why we could not say. */
function Identification({ lot, correction }: { lot: LotDetailLot; correction?: ReactNode }) {
  return (
    <DetailCard label="What this lot is" heading="Identification">
      {lot.identifiedAs ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-sans text-base text-ink">{lot.identifiedAs}</p>
          {lot.identificationConfidence != null ? (
            <ConfidenceBadge score={lot.identificationConfidence} showScore />
          ) : null}
        </div>
      ) : (
        <p className="font-sans text-sm text-ink-muted">
          We could not work out what this lot is from the catalogue, so there is no resale range and
          no bid figure for it.
        </p>
      )}
      {lot.conditionNote ? (
        <p className="mt-3 font-sans text-sm text-ink">The catalogue says: {lot.conditionNote}</p>
      ) : null}
      {lot.correctedByYou ? (
        <p className="mt-3 font-sans text-sm text-ink-muted">
          This is what you told us it is. The figures below are worked out from it, and nobody else
          analysing this sale sees your correction.
        </p>
      ) : null}
      {correction}
    </DetailCard>
  );
}

export function LotDetail({
  lot,
  valuation,
  comparables,
  bids,
  missingBidReason,
  method,
  correction,
  exclusionFor,
  exclusionNote,
  className = '',
}: LotDetailProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* A navy panel, because that is where a drawing sheet frame and a title
          block belong. Putting the title block on a light card dropped its
          line cyan text to 1.69 against the page, which the axe gate caught
          and was right to: the design system pairs these with navy. */}
      <SheetFrame>
        <h1 className="font-sans text-2xl font-semibold text-ink-on-navy">{lot.title}</h1>
        <TitleBlock
          className="mt-4"
          caption="Lot details"
          entries={[
            { label: 'Lot', value: lot.lotNumber },
            ...(lot.saleTitle ? [{ label: 'Sale', value: lot.saleTitle }] : []),
          ]}
        />
      </SheetFrame>

      <Identification lot={lot} correction={correction} />

      <DetailCard label="At auction" heading="What it is bid to now">
        <PriceLine
          label="Current bid"
          amount={lot.currentBid}
          emptyText="No bids yet"
          note={lot.bidNote}
        />
        {valuation.auctionMarket ? (
          <div className="mt-5 border-t border-border pt-4">
            <PriceLine
              label="What these usually fetch at auction"
              amount={valuation.auctionMarket.typical}
              note={`From ${valuation.auctionMarket.results} past ${
                valuation.auctionMarket.results === 1 ? 'sale' : 'sales'
              } of the same kind of item, between ${money(valuation.auctionMarket.low)} and ${money(
                valuation.auctionMarket.high,
              )}. This is what other buyers have paid to win one, which is not the same as what it resells for.`}
            />
          </div>
        ) : null}
      </DetailCard>

      {/* Only the ones that counted, because a reader who set two of their
          four sales aside should not be told we found four and could not use
          them. They know why. */}
      <Resale valuation={valuation} found={counted(comparables).length} />
      <Evidence
        comparables={comparables}
        exclusionFor={exclusionFor}
        exclusionNote={exclusionNote}
      />

      <DetailCard label="Your figures" heading="What this means for you">
        <p className="mb-4 font-sans text-sm text-ink-muted">
          These three figures come from the cautious resale above, this auction&apos;s buyer&apos;s
          premium, your costs and the profit you said you want. A buyer&apos;s premium is the fee
          the auction house adds to your winning bid.
        </p>
        <BidLimits {...bids} missingReason={missingBidReason} />
        {method ? <InfoNote className="mt-4">{method}</InfoNote> : null}
      </DetailCard>
    </div>
  );
}
