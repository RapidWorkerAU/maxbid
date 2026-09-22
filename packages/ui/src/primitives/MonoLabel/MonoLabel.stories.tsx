import type { Meta, StoryObj } from '@storybook/react-vite';
import { MonoLabel } from './MonoLabel';
import { Money } from '../Money/Money';

const meta: Meta<typeof MonoLabel> = {
  title: 'Primitives/MonoLabel',
  component: MonoLabel,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: { children: 'Most you should bid' },
};
export default meta;

type Story = StoryObj<typeof MonoLabel>;

export const Muted: Story = {};
export const Ink: Story = { args: { tone: 'ink' } };
export const Small: Story = { args: { size: 'xs' } };
export const LongContent: Story = { args: { children: 'Estimated profit at this hammer bid' } };

export const OnNavy: Story = {
  args: { tone: 'onNavy' },
  render: (args) => (
    <div className="bg-navy p-6">
      <MonoLabel {...args} />
    </div>
  ),
};

export const AboveAFigure: Story = {
  render: () => (
    <div className="flex flex-col gap-6 text-ink">
      <div>
        <MonoLabel>Most you should bid</MonoLabel>
        <Money amount={7936.01} rounding="down" size="lg" />
      </div>
      <div className="bg-navy p-6">
        <MonoLabel tone="onNavy">Break even bid</MonoLabel>
        <span className="text-ink-on-navy">
          <Money amount={11369.49} rounding="down" size="lg" />
        </span>
      </div>
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...AboveAFigure,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...AboveAFigure,
  globals: { viewport: { value: 'desktop1440' } },
};
