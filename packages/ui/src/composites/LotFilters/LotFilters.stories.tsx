import type { Meta, StoryObj } from '@storybook/react-vite';
import { LotFilters, NO_FILTERS } from './LotFilters';

const meta: Meta<typeof LotFilters> = {
  title: 'Composites/LotFilters',
  component: LotFilters,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: {
    filters: NO_FILTERS,
    onChange: () => {},
    locations: ['Altona North, VIC', 'Wingfield, SA', 'Yatala, QLD'],
    showing: { shown: 36, total: 36 },
  },
};
export default meta;

type Story = StoryObj<typeof LotFilters>;

export const Default: Story = {};

/** Narrowed down. The sentence says the rest are still in the catalogue. */
export const Narrowed: Story = {
  args: {
    filters: { ...NO_FILTERS, minMaxBid: 5000, closingWithinHours: 24 },
    showing: { shown: 4, total: 36 },
  },
};

/**
 * The reader has chosen to hide the lots we could not value. The only way
 * those ever leave the list, because we did not say they were unsuitable, we
 * said we could not tell.
 */
export const HidingWhatWeCouldNotValue: Story = {
  args: {
    filters: { ...NO_FILTERS, includeUnvalued: false },
    showing: { shown: 2, total: 36 },
  },
};

/** One place, so there is nothing to choose between and no control for it. */
export const OnlyOneLocation: Story = {
  args: { locations: ['Altona North, VIC'] },
};

/** A sale where no lot states where it is. */
export const NoLocations: Story = {
  args: { locations: [] },
};
