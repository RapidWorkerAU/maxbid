import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreditPreview } from './CreditPreview';

const meta: Meta<typeof CreditPreview> = {
  title: 'Composites/CreditPreview',
  component: CreditPreview,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: { selected: 4, available: 10, onConfirm: () => {} },
};
export default meta;

type Story = StoryObj<typeof CreditPreview>;

export const Default: Story = {};

export const OneLot: Story = { args: { selected: 1, available: 10 } };

/** Spending the balance exactly, which is allowed. */
export const ExactlyEnough: Story = { args: { selected: 10, available: 10 } };

/**
 * F17. The user cannot exceed the credits they have, so the button is off and
 * the sentence says how many more are needed. It does not say the shortlist
 * is too big or suggest which lots to drop.
 */
export const NotEnoughCredits: Story = { args: { selected: 30, available: 10 } };

/** An organisation with nothing left. */
export const NoCreditsAtAll: Story = { args: { selected: 3, available: 0 } };

/** While the shortlist is being sent, so it cannot be sent twice. */
export const Starting: Story = { args: { confirming: true } };

/** Nothing ticked, so there is nothing to say and nothing is shown. */
export const NothingTicked: Story = { args: { selected: 0 } };
