import type { Meta, StoryObj } from '@storybook/react-vite';
import { DetailCard } from './DetailCard';
import { PriceLine } from '../PriceLine';

const meta: Meta<typeof DetailCard> = {
  title: 'Composites/DetailCard',
  component: DetailCard,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: {
    label: 'Identification',
    children: <p className="font-sans text-sm text-ink">A 2015 Invented Wagon Alpha, diesel.</p>,
  },
};
export default meta;

type Story = StoryObj<typeof DetailCard>;

export const Default: Story = {};

export const WithAHeading: Story = {
  args: { label: 'Evidence', heading: 'Comparable sales we found', as: 'h3' },
};

/** What it is actually for: a stack of figures that each say what they are. */
export const HoldingFigures: Story = {
  args: {
    label: 'Costs',
    heading: 'What this lot costs you',
    children: (
      <div className="space-y-3">
        <PriceLine label="Buyer's premium" amount={544.5} showCents />
        <PriceLine label="Transport" amount={450} />
        <PriceLine label="Repairs" amount={1200} />
        <PriceLine label="Total costs" amount={2194.5} showCents />
      </div>
    ),
  },
};

/** A label long enough to test the edge tab. */
export const LongLabel: Story = {
  args: { label: 'How this was calculated' },
};
