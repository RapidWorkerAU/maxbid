import type { Meta, StoryObj } from '@storybook/react-vite';
import { LINE_ICON_NAMES, LineIcon } from './LineIcon';

const meta: Meta<typeof LineIcon> = {
  title: 'Primitives/LineIcon',
  component: LineIcon,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: { name: 'search' },
};
export default meta;

type Story = StoryObj<typeof LineIcon>;

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const Labelled: Story = { args: { name: 'external', label: 'Opens in a new tab' } };

export const EveryIcon: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
      {LINE_ICON_NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-1 text-ink">
          <LineIcon name={name} size="lg" />
          <span className="font-mono text-[0.625rem] uppercase tracking-wide">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const InsideAControl: Story = {
  render: () => (
    <div className="flex flex-col gap-3 font-sans text-sm text-ink">
      <p className="max-w-md">
        An icon inside a control carries no name, because the words beside it
        already say what the control does.
      </p>
      <span className="inline-flex items-center gap-2">
        <LineIcon name="download" />
        Download the bid sheet
      </span>
      <span className="inline-flex items-center gap-2">
        <LineIcon name="clock" />
        Closes in 2 hours
      </span>
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...EveryIcon,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...EveryIcon,
  globals: { viewport: { value: 'desktop1440' } },
};
