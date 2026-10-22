import type { Meta, StoryObj } from '@storybook/react-vite';
import { RunProgress } from './RunProgress';

const meta: Meta<typeof RunProgress> = {
  title: 'Composites/RunProgress',
  component: RunProgress,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: {
    label: 'Reading the lots you chose, from their photographs',
    done: 3,
    running: 2,
    failed: 0,
    total: 8,
    note: 'Each lot takes a minute or two, because we read its page and then look at every photograph on it. You can leave this page and come back.',
  },
};
export default meta;

type Story = StoryObj<typeof RunProgress>;

export const PartWayThrough: Story = {};

/** The moment it starts. The bar still shows a mark, because nought reads as nothing happening. */
export const JustStarted: Story = { args: { done: 0, running: 2, failed: 0 } };

export const NearlyDone: Story = { args: { done: 7, running: 1, failed: 0 } };

export const Finished: Story = { args: { done: 8, running: 0, failed: 0 } };

/** Some lots had no photographs to read. Those were not charged for. */
export const FinishedWithFailures: Story = { args: { done: 6, running: 0, failed: 2 } };

/** One lot, where every count is singular. */
export const OneLot: Story = { args: { done: 1, running: 0, failed: 0, total: 1 } };

/** Nothing running, so nothing shown at all. */
export const NothingToShow: Story = { args: { done: 0, running: 0, failed: 0, total: 0 } };
