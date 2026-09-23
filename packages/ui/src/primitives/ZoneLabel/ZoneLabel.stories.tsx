import type { Meta, StoryObj } from '@storybook/react-vite';
import { ZoneLabel } from './ZoneLabel';

const meta: Meta<typeof ZoneLabel> = {
  title: 'Primitives/ZoneLabel',
  component: ZoneLabel,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: { zone: 'onTarget' },
};
export default meta;

type Story = StoryObj<typeof ZoneLabel>;

export const OnTarget: Story = {};
export const BelowTarget: Story = { args: { zone: 'belowTarget' } };
export const LossRisk: Story = { args: { zone: 'lossRisk' } };
export const Quiet: Story = { args: { tone: 'quiet' } };

export const EveryZone: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <ZoneLabel zone="onTarget" />
        <ZoneLabel zone="belowTarget" />
        <ZoneLabel zone="lossRisk" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <ZoneLabel zone="onTarget" tone="quiet" />
        <ZoneLabel zone="belowTarget" tone="quiet" />
        <ZoneLabel zone="lossRisk" tone="quiet" />
      </div>
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...EveryZone,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...EveryZone,
  globals: { viewport: { value: 'desktop1440' } },
};
