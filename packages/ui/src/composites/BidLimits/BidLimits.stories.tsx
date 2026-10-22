import type { Meta, StoryObj } from '@storybook/react-vite';
import { BidLimits } from './BidLimits';

// The worked example from bid-calculation.md, which was checked against the
// live calculator in workbook tab 10.
const meta: Meta<typeof BidLimits> = {
  title: 'Composites/BidLimits',
  component: BidLimits,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: { targetBid: 7936, limitBid: 10081, breakEvenBid: 11369 },
};
export default meta;

type Story = StoryObj<typeof BidLimits>;

export const Default: Story = {};

/**
 * The thing to check. The three figures rise in order, so break even is the
 * biggest number on screen and the one to act on is the smallest. Only the
 * target bid is marked, and the break even line says that a bid above it
 * loses money.
 */
export const TheOrderingIsCounterintuitive: Story = {};

/** A buyer not registered for GST can bid more, because they keep the whole resale. */
export const UnregisteredBuyer: Story = {
  args: { targetBid: 8248, limitBid: 10393, breakEvenBid: 11369 },
};

/** F26. Not enough evidence means no figures, and a reason rather than blanks. */
export const NotEnoughEvidence: Story = {
  args: {
    targetBid: null,
    limitBid: null,
    breakEvenBid: null,
    missingReason:
      'We could not find enough comparable sales to work out what this lot is worth, so we cannot work out a bid from it.',
  },
};

/** Where the current bid already exceeds the target, the figure is still stated. */
export const TargetAlreadyPassed: Story = {
  args: { targetBid: 0, limitBid: 1200, breakEvenBid: 3400 },
};

/** A lot cheap enough that the three figures sit close together. */
export const SmallFigures: Story = {
  args: { targetBid: 180, limitBid: 240, breakEvenBid: 309 },
};
