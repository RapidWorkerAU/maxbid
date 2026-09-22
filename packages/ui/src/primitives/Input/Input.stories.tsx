import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: { id: 'catalogue-url', label: 'Auction catalogue link' },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithHint: Story = {
  args: {
    type: 'url',
    hint: 'Paste the link to a Grays, Pickles or Lloyds catalogue.',
    placeholder: 'https://www.graysonline.com/sale/...',
  },
};

export const WithError: Story = {
  args: {
    type: 'url',
    hint: 'Paste the link to a Grays, Pickles or Lloyds catalogue.',
    error: 'We do not support that auction house yet. You can upload the catalogue as a PDF instead.',
    defaultValue: 'https://example.com/sale',
  },
};

export const Mono: Story = {
  args: { id: 'lot-number', label: 'Lot number', mono: true, defaultValue: 'LOT-04821' },
};

export const NumberField: Story = {
  args: { id: 'target-profit', label: 'Target profit in dollars', type: 'number', defaultValue: 4000 },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Locked by your organisation' } };

export const EveryState: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Input id="s1" label="Auction catalogue link" type="url" />
      <Input id="s2" label="Base location" hint="We use this to estimate transport." />
      <Input id="s3" label="Lot number" mono defaultValue="LOT-04821" />
      <Input
        id="s4"
        label="Email address"
        type="email"
        error="Enter an email address so we can send your results."
      />
      <Input id="s5" label="Minimum acceptable profit" type="number" disabled defaultValue={1500} />
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...EveryState,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...EveryState,
  globals: { viewport: { value: 'desktop1440' } },
};
