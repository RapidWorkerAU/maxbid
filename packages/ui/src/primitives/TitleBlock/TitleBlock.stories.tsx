import type { Meta, StoryObj } from '@storybook/react-vite';
import { TitleBlock } from './TitleBlock';

const entries = [
  { label: 'Project', value: 'MaxBid' },
  { label: 'Sheet', value: '01' },
  { label: 'Region', value: 'Australia' },
];

const meta: Meta<typeof TitleBlock> = {
  title: 'Primitives/TitleBlock',
  component: TitleBlock,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: { entries },
  decorators: [
    (Story) => (
      <div className="bg-navy p-6">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof TitleBlock>;

export const Default: Story = {};

export const SingleEntry: Story = { args: { entries: [{ label: 'Sheet', value: '01' }] } };

export const LongContent: Story = {
  args: {
    entries: [
      { label: 'Project', value: 'MaxBid auction bid intelligence' },
      { label: 'Sheet', value: 'Catalogue results, desktop' },
      { label: 'Region', value: 'Australia, all states and territories' },
    ],
  },
};

export const AtMobileWidth: Story = { globals: { viewport: { value: 'mobile375' } } };
export const AtDesktopWidth: Story = { globals: { viewport: { value: 'desktop1440' } } };
