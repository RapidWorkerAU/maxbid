import type { Meta, StoryObj } from '@storybook/react-vite';
import { Wordmark } from './Wordmark';

const meta: Meta<typeof Wordmark> = {
  title: 'Primitives/Wordmark',
  component: Wordmark,
  tags: ['in-review'],
};
export default meta;

type Story = StoryObj<typeof Wordmark>;

export const Medium: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };

export const OnNavy: Story = {
  args: { onNavy: true },
  render: (args) => (
    <div className="bg-navy p-8">
      <Wordmark {...args} />
    </div>
  ),
};

export const EverySize: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-end gap-6">
        <Wordmark size="sm" />
        <Wordmark size="md" />
        <Wordmark size="lg" />
      </div>
      <div className="flex items-end gap-6 bg-navy p-6">
        <Wordmark size="sm" onNavy />
        <Wordmark size="md" onNavy />
        <Wordmark size="lg" onNavy />
      </div>
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...EverySize,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...EverySize,
  globals: { viewport: { value: 'desktop1440' } },
};
