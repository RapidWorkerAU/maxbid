import type { Meta, StoryObj } from '@storybook/react-vite';
import { StopLine } from './StopLine';

const meta: Meta<typeof StopLine> = {
  title: 'Primitives/StopLine',
  component: StopLine,
  tags: ['approved'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof StopLine>;

export const Regular: Story = { render: () => <div className="w-40"><StopLine /></div> };
export const Thin: Story = { render: () => <div className="w-40"><StopLine thickness="thin" /></div> };
export const Thick: Story = { render: () => <div className="w-40"><StopLine thickness="thick" /></div> };

export const Labelled: Story = {
  render: () => (
    <div className="w-64">
      <StopLine thickness="thick" label="Stop line at the break even bid of $11,369" />
    </div>
  ),
};

export const EveryUse: Story = {
  render: () => (
    <div className="flex flex-col gap-6 text-ink">
      <div>
        <p className="mb-1 text-sm">Under the wordmark</p>
        <div className="w-12">
          <StopLine />
        </div>
      </div>
      <div>
        <p className="mb-1 text-sm">Active tab marker</p>
        <div className="w-24">
          <StopLine thickness="thin" />
        </div>
      </div>
      <div>
        <p className="mb-1 text-sm">The stop line on a price rail</p>
        <div className="w-full max-w-md">
          <StopLine thickness="thick" label="Stop line at the break even bid of $11,369" />
        </div>
      </div>
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...EveryUse,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...EveryUse,
  globals: { viewport: { value: 'desktop1440' } },
};
