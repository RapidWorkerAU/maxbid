import type { Meta, StoryObj } from '@storybook/react-vite';
import { Money } from './Money';
import { MonoLabel } from '../MonoLabel/MonoLabel';

const meta: Meta<typeof Money> = {
  title: 'Primitives/Money',
  component: Money,
  tags: ['in-review'],
  args: { amount: 7936.01 },
};
export default meta;

type Story = StoryObj<typeof Money>;

export const Default: Story = {};
export const WithCents: Story = { args: { showCents: true } };
export const Hero: Story = { args: { size: 'hero', rounding: 'down' } };
export const Negative: Story = { args: { amount: -1240 } };
export const NegativeForExport: Story = { args: { amount: -1240, forExport: true } };
export const Zero: Story = { args: { amount: 0 } };
export const VeryLarge: Story = { args: { amount: 1250000 } };

export const BidFiguresRoundDown: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-ink">
      <p className="max-w-md font-sans text-sm">
        The three bid figures round down and are never rounded up, so the
        limit bid of $10,081.94 shows as $10,081 rather than $10,082.
      </p>
      {[
        ['Target bid', 7936.01],
        ['Limit bid', 10081.94],
        ['Break even bid', 11369.49],
      ].map(([label, amount]) => (
        <div key={label as string}>
          <MonoLabel>{label as string}</MonoLabel>
          <Money amount={amount as number} rounding="down" size="lg" />
        </div>
      ))}
    </div>
  ),
};

export const EverySize: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-ink">
      <Money amount={7936.01} size="sm" />
      <Money amount={7936.01} size="md" />
      <Money amount={7936.01} size="lg" />
      <Money amount={7936.01} size="hero" rounding="down" />
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...BidFiguresRoundDown,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...BidFiguresRoundDown,
  globals: { viewport: { value: 'desktop1440' } },
};
