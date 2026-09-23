import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmailCapture } from './EmailCapture';

const base = {
  id: 'waitlist-email',
  label: 'Email address',
  hint: 'We will tell you when MaxBid opens, and nothing else.',
  submitLabel: 'Join the waitlist',
  pendingLabel: 'Adding you to the waitlist',
  successHeading: 'You are on the list',
  successBody:
    'We will email you when MaxBid opens. Founding member pricing is held for everyone who joined before launch.',
  action: () => {},
};

const meta: Meta<typeof EmailCapture> = {
  title: 'Composites/EmailCapture',
  component: EmailCapture,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: { ...base, state: { status: 'idle' } },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md bg-surface p-6">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof EmailCapture>;

export const Idle: Story = {};

export const Pending: Story = { args: { pending: true } };

export const WithError: Story = {
  args: {
    state: { status: 'error', message: 'Enter an email address so we can tell you when we open.' },
  },
};

export const Success: Story = { args: { state: { status: 'success' } } };

export const WithNote: Story = {
  args: {
    note: 'We will only use your address to tell you when MaxBid opens. You can unsubscribe at any time.',
  },
};

export const LongContent: Story = {
  args: {
    label: 'The email address you would like your early access invitation sent to',
    hint: 'We will tell you when MaxBid opens, hold your founding member pricing, and send you nothing else at all.',
  },
};

export const AtMobileWidth: Story = {
  args: { note: 'We will only use your address to tell you when MaxBid opens.' },
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  args: { note: 'We will only use your address to tell you when MaxBid opens.' },
  globals: { viewport: { value: 'desktop1440' } },
};
