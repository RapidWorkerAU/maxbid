import { PriceLine } from '../PriceLine';

/**
 * UI21. The three bid figures, with the one that matters marked and the one
 * that is highest explained.
 *
 * The figures and their names come from bid-calculation.md and decision
 * record 0002.
 *
 * **The ordering is the whole problem this component solves.** The three rise
 * in that order, so the break even bid is always the highest figure on the
 * screen, and the target bid, which is the one to act on, is the lowest. A
 * reader who assumes the biggest number is the answer reads it exactly
 * backwards and bids past the price where they stop making money.
 *
 * So the target bid is the only figure in marker yellow, which B09 reserves
 * for the main action and the most you should bid, and the break even bid
 * carries the sentence saying that a bid above it loses money. Every figure
 * says what it is, as WR03 requires, because this is where all three terms
 * first appear on the lot screen.
 *
 * We state what each figure is and leave the decision to the reader. Nothing
 * here says to bid or not to bid.
 */
export type BidLimitsProps = {
  /** The highest bid that still meets the target profit. Null where we cannot say. */
  targetBid: number | null;
  /** The highest bid that still meets the minimum acceptable profit. */
  limitBid: number | null;
  /** The bid at which estimated profit is zero. */
  breakEvenBid: number | null;
  /**
   * Why there are no figures, when there are none.
   *
   * A reason is better than three blanks, which invite the reader to supply
   * their own answer.
   */
  missingReason?: string;
  className?: string;
};

export function BidLimits({
  targetBid,
  limitBid,
  breakEvenBid,
  missingReason,
  className = '',
}: BidLimitsProps) {
  const nothingToShow = targetBid === null && limitBid === null && breakEvenBid === null;

  if (nothingToShow && missingReason) {
    return <p className={`font-sans text-sm text-ink-muted ${className}`}>{missingReason}</p>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <PriceLine
        label="The most you should bid"
        amount={targetBid}
        rounding="down"
        emphasis
        note="This is the highest bid that still reaches your target profit. It is called the target bid."
      />
      <PriceLine
        label="Limit bid"
        amount={limitBid}
        rounding="down"
        note="The highest bid that still reaches the smallest profit you said you would accept."
      />
      <PriceLine
        label="Break even bid"
        amount={breakEvenBid}
        rounding="down"
        note="The bid at which your estimated profit is nothing. A bid above this figure loses money. It is the highest of the three, so it is not the figure to aim for."
      />
    </div>
  );
}
