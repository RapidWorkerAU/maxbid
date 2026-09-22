import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ButtonLink } from './Button';

// The status tag must match docs/04-build/component-register.md.
// scripts/check-story-tags.mjs fails the build when it does not.
const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['in-review'],
  args: { children: 'Analyse 12 lots' },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Download bid sheet' },
};
export const Ghost: Story = { args: { variant: 'ghost', children: 'Cancel' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete this analysis' } };

export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true, children: 'Analysing' } };

export const LongContent: Story = {
  args: { children: 'Analyse the twelve lots you shortlisted for twelve credits' },
};
export const ShortContent: Story = { args: { children: 'Go' } };

export const EveryVariant: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Analyse 12 lots</Button>
      <Button variant="secondary">Download bid sheet</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="danger">Delete this analysis</Button>
      <Button loading>Analysing</Button>
      <Button disabled>Unavailable</Button>
      <ButtonLink href="#pricing" variant="secondary">
        See pricing
      </ButtonLink>
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...EveryVariant,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...EveryVariant,
  globals: { viewport: { value: 'desktop1440' } },
};
