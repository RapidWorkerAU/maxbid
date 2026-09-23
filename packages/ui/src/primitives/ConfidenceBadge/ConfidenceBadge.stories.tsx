import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfidenceBadge } from './ConfidenceBadge';

const meta: Meta<typeof ConfidenceBadge> = {
  title: 'Primitives/ConfidenceBadge',
  component: ConfidenceBadge,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: { score: 82 },
};
export default meta;

type Story = StoryObj<typeof ConfidenceBadge>;

export const High: Story = {};
export const Medium: Story = { args: { score: 61 } };
export const Low: Story = { args: { score: 34 } };
export const Insufficient: Story = { args: { score: 12 } };
export const NoEvidence: Story = { args: { score: undefined } };
export const WithScoreShown: Story = { args: { score: 82, showScore: true } };

export const EveryBand: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <ConfidenceBadge score={82} showScore />
      <ConfidenceBadge score={61} showScore />
      <ConfidenceBadge score={34} showScore />
      <ConfidenceBadge score={12} showScore />
      <ConfidenceBadge />
    </div>
  ),
};

export const AtTheBandEdges: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2 font-sans text-sm text-ink">
      <p className="max-w-md">
        High is 75 and above, medium is 50 to 74, low is 25 to 49, and below 25
        there is not enough evidence.
      </p>
      {[75, 74, 50, 49, 25, 24].map((score) => (
        <ConfidenceBadge key={score} score={score} showScore />
      ))}
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...EveryBand,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...EveryBand,
  globals: { viewport: { value: 'desktop1440' } },
};
