import type { Meta, StoryObj } from '@storybook/react-vite';
import { MatchBadge } from './MatchBadge';

const meta: Meta<typeof MatchBadge> = {
  title: 'Primitives/MatchBadge',
  component: MatchBadge,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: { level: 'exact' },
};
export default meta;

type Story = StoryObj<typeof MatchBadge>;

export const Exact: Story = {};
export const NearExact: Story = { args: { level: 'nearExact' } };
export const HigherSpecification: Story = { args: { level: 'higherSpec' } };
export const LowerSpecification: Story = { args: { level: 'lowerSpec' } };
export const SimilarAlternative: Story = { args: { level: 'similarAlternative' } };
export const Insufficient: Story = { args: { level: 'insufficient' } };
export const WithWeight: Story = { args: { level: 'nearExact', weight: 0.85 } };

export const EveryLevel: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <MatchBadge level="exact" weight={1} />
      <MatchBadge level="nearExact" weight={0.85} />
      <MatchBadge level="higherSpec" weight={0.6} />
      <MatchBadge level="lowerSpec" weight={0.6} />
      <MatchBadge level="similarAlternative" weight={0.4} />
      <MatchBadge level="insufficient" weight={0} />
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...EveryLevel,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...EveryLevel,
  globals: { viewport: { value: 'desktop1440' } },
};
