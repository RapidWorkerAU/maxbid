import type { Meta, StoryObj } from '@storybook/react-vite';
import { DetailLabel } from './DetailLabel';

const meta: Meta<typeof DetailLabel> = {
  title: 'Primitives/DetailLabel',
  component: DetailLabel,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: { children: 'Detail A' },
};
export default meta;

type Story = StoryObj<typeof DetailLabel>;

export const Navy: Story = {};
export const LongContent: Story = { args: { children: 'Plan 01, catalogue results' } };

export const OnNavy: Story = {
  args: { tone: 'onNavy' },
  render: (args) => (
    <div className="bg-navy p-6">
      <DetailLabel {...args} />
    </div>
  ),
};

export const OnACard: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {['Detail A', 'Detail B', 'Plan 01'].map((label) => (
        <div key={label} className="border border-border bg-surface">
          <DetailLabel>{label}</DetailLabel>
          <p className="p-4 font-sans text-sm text-ink">
            Result cards are labelled the way views on a drawing are labelled.
          </p>
        </div>
      ))}
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...OnACard,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...OnACard,
  globals: { viewport: { value: 'desktop1440' } },
};
