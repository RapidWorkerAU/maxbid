import type { Meta, StoryObj } from '@storybook/react-vite';
import { LeaderLine } from './LeaderLine';
import { Money } from '../Money/Money';

const meta: Meta<typeof LeaderLine> = {
  title: 'Primitives/LeaderLine',
  component: LeaderLine,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof LeaderLine>;

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <LeaderLine label="Transport">
        <Money amount={750} />
      </LeaderLine>
    </div>
  ),
};

export const Total: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <LeaderLine label="Total other costs" strong>
        <Money amount={3930} />
      </LeaderLine>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <LeaderLine label="Testing, certification and electrical compliance">
        <Money amount={480} />
      </LeaderLine>
    </div>
  ),
};

export const ACostList: Story = {
  render: () => (
    <dl className="flex w-full max-w-md flex-col gap-2">
      <LeaderLine inList label="Transport">
        <Money amount={750} />
      </LeaderLine>
      <LeaderLine inList label="Repairs">
        <Money amount={1500} />
      </LeaderLine>
      <LeaderLine inList label="Cleaning and preparation">
        <Money amount={200} />
      </LeaderLine>
      <LeaderLine inList label="Selling fees">
        <Money amount={1480} />
      </LeaderLine>
      <LeaderLine inList strong label="Total other costs">
        <Money amount={3930} />
      </LeaderLine>
    </dl>
  ),
};

export const AtMobileWidth: Story = {
  ...ACostList,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...ACostList,
  globals: { viewport: { value: 'desktop1440' } },
};
