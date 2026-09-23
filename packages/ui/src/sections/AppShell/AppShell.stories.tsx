import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShell } from './AppShell';

const links = [
  { href: '/', label: 'Dashboard', icon: 'search' as const },
  { href: '/watchlist', label: 'Watchlist', icon: 'clock' as const },
  { href: '/outcomes', label: 'Outcomes', icon: 'check' as const },
];

const meta: Meta<typeof AppShell> = {
  title: 'Sections/AppShell',
  component: AppShell,
  tags: ['in-review'],
  parameters: { layout: 'fullscreen' },
  args: {
    links,
    currentPath: '/',
    children: (
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 max-w-prose text-ink-muted">
          Your recent analyses appear here. Paste an auction catalogue link to
          start a new one.
        </p>
      </div>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof AppShell>;

export const Default: Story = {};
export const OnAnotherPage: Story = { args: { currentPath: '/watchlist' } };
export const WithFooter: Story = { args: { footer: 'Perth Cabinet Doors' } };

export const LongContent: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} className="max-w-prose text-ink-muted">
            A long page scrolls behind the bottom bar on a phone, which is why
            the main area carries extra padding at the foot.
          </p>
        ))}
      </div>
    ),
  },
};

export const EmptyContent: Story = { args: { children: null } };

export const AtMobileWidth: Story = { globals: { viewport: { value: 'mobile375' } } };
export const AtDesktopWidth: Story = { globals: { viewport: { value: 'desktop1440' } } };
