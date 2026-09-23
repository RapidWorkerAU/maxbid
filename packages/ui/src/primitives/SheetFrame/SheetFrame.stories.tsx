import type { Meta, StoryObj } from '@storybook/react-vite';
import { SheetFrame } from './SheetFrame';
import { DetailLabel } from '../DetailLabel/DetailLabel';
import { MonoLabel } from '../MonoLabel/MonoLabel';
import { Money } from '../Money/Money';
import { TitleBlock } from '../TitleBlock/TitleBlock';

const meta: Meta<typeof SheetFrame> = {
  title: 'Primitives/SheetFrame',
  component: SheetFrame,
  tags: ['approved'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SheetFrame>;

export const Default: Story = {
  render: () => (
    <SheetFrame>
      <p className="font-sans">A navy panel with the drawing sheet frame around it.</p>
    </SheetFrame>
  ),
};

export const Tight: Story = {
  render: () => (
    <SheetFrame inset="tight">
      <p className="font-sans">A tighter inset, for smaller panels.</p>
    </SheetFrame>
  ),
};

export const WithABidFigure: Story = {
  render: () => (
    <div className="max-w-md">
      <SheetFrame>
        <MonoLabel tone="onNavy">Most you should bid</MonoLabel>
        <Money amount={7936.01} rounding="down" size="hero" className="text-accent" />
        <p className="mt-3 font-sans text-sm text-ink-muted-on-navy">
          This is the highest bid that still meets your target profit of $4,000.
        </p>
      </SheetFrame>
    </div>
  ),
};

export const WithATitleBlock: Story = {
  render: () => (
    <SheetFrame>
      <div className="flex flex-col gap-4">
        <DetailLabel tone="onNavy">Detail A</DetailLabel>
        <p className="font-sans text-ink-on-navy">
          The header of the public site carries a title block in the corner.
        </p>
        <TitleBlock
          entries={[
            { label: 'Project', value: 'MaxBid' },
            { label: 'Sheet', value: '01' },
            { label: 'Region', value: 'Australia' },
          ]}
        />
      </div>
    </SheetFrame>
  ),
};

export const EmptyContent: Story = { render: () => <SheetFrame>{null}</SheetFrame> };

export const AtMobileWidth: Story = {
  ...WithABidFigure,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...WithATitleBlock,
  globals: { viewport: { value: 'desktop1440' } },
};
