import { BidLimits } from '../../composites/BidLimits';
import { DetailCard } from '../../composites/DetailCard';
import { EvidenceRow, type Comparable } from '../../composites/EvidenceRow';
import { PriceLine } from '../../composites/PriceLine';
import { ConfidenceBadge } from '../../primitives/ConfidenceBadge';
import { InfoNote } from '../../primitives/InfoNote';
import { MonoLabel } from '../../primitives/MonoLabel';
import { SheetFrame } from '../../primitives/SheetFrame';
import { TitleBlock } from '../../primitives/TitleBlock';

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
export type LotDetailLot = {
  /** The auction's own lot number, such as 0004-23502418. */
  lotNumber: string;
  /** What the catalogue called it. */
  title: string;
  currentBid: number | null;
  /** When the bid was last read from the site. Decision record 0026. */
  bidNote?: string;
  closesAt?: string | null;
  /** What we decided the lot is, in words. Null where we could not say. */
  identifiedAs: string | null;
  /** 0 to 100 from the identification. */
  identificationConfidence?: number | null;
  /** Anything the catalogue said about condition, such as a write off marker. */
  conditionNote?: string | null;
  /** The sale this lot belongs to. */
  saleTitle?: string | null;
};

export type LotDetailValuation = {
  /** The cautious end, which the bid figures are worked out from. */
  conservative: number | null;
  expected: number | null;
  optimistic: number | null;
  /** 0 to 100. Leave out where the evidence threshold was not met. */
  confidence?: number | null;
};

export type LotDetailProps = {
  lot: LotDetailLot;
  valuation: LotDetailValuation;
  comparables: Comparable[];
  bids: { targetBid: number | null; limitBid: number | null; breakEvenBid: number | null };
  /** Why there are no bid figures, when there are none. */
  missingBidReason?: string;
  /** How the figures were worked out, in words. F59. */
  method?: string;
  className?: string;
};

/** What we decided the lot is, or why we could not say. */
function Identification({ lot }: { lot: LotDetailLot }) {
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
    </DetailCard>
  );
}

/** What we think it resells for, and how sure we are. */
function Resale({ valuation }: { valuation: LotDetailValuation }) {
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
        <p className="font-sans text-sm text-ink-muted">
          We could not find enough comparable sales to say what this lot resells for. A comparable
          is a sale of the same or a similar item that we use as evidence.
        </p>
      )}
    </DetailCard>
  );
}

/** The sales the range was worked out from. F59, and the point of the screen. */
function Evidence({ comparables }: { comparables: Comparable[] }) {
  return (
    <DetailCard label="Evidence" heading="The sales we worked from">
      {comparables.length > 0 ? (
        <>
          <p className="mb-3 font-sans text-sm text-ink-muted">
            Each sale below counted towards the range above. A sold price counts for more than an
            advertised price, a closer match counts for more than a rough one, and a recent price
            counts for more than an old one. The weight shows how much each one counted.
          </p>
          <div>
            {comparables.map((comparable) => (
              <EvidenceRow key={comparable.id} comparable={comparable} />
            ))}
          </div>
        </>
      ) : (
        <p className="font-sans text-sm text-ink-muted">
          We have not found any comparable sales for this lot yet.
        </p>
      )}
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

      <Identification lot={lot} />

      <DetailCard label="At auction" heading="What it is bid to now">
        <PriceLine
          label="Current bid"
          amount={lot.currentBid}
          emptyText="No bids yet"
          note={lot.bidNote}
        />
      </DetailCard>

      <Resale valuation={valuation} />
      <Evidence comparables={comparables} />

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
