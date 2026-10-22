import type { Meta, StoryObj } from '@storybook/react-vite';
import { PriceLine } from './PriceLine';

const meta: Meta<typeof PriceLine> = {
  title: 'Composites/PriceLine',
  component: PriceLine,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: { label: 'Transport', amount: 450 },
};
export default meta;

type Story = StoryObj<typeof PriceLine>;

export const Default: Story = {};

/** Cents belong in the calculator detail only. */
export const WithCents: Story = {
  args: { label: "Buyer's premium", amount: 544.5, showCents: true },
};

/** The only place marker yellow is allowed on a figure. B09. */
export const TheMostYouShouldBid: Story = {
  args: {
    label: 'The most you should bid',
    amount: 7936,
    rounding: 'down',
    emphasis: true,
    note: 'This is the highest bid that still reaches your target profit. It is called the target bid.',
  },
};

/** No figure is a statement, not a blank. */
export const NotWorkedOut: Story = {
  args: { label: 'Target bid', amount: null },
};

export const ACustomReason: Story = {
  args: { label: 'The most you should bid', amount: null, emptyText: 'Below your target' },
};

/** A long label against a long figure, which is where a row breaks. */
export const LongLabelAndBigFigure: Story = {
  args: {
    label: 'Removal, cleaning, testing and storage while the lot waits for transport',
    amount: 1234567,
  },
};
