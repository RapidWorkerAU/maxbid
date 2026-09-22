import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

// The status tag must match docs/04-build/component-register.md.
// scripts/check-story-tags.mjs fails the build when it does not.
const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['draft'],
  args: { children: 'Analyse' },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', children: 'Download bid sheet' } };
export const Disabled: Story = { args: { disabled: true } };
export const LongContent: Story = {
  args: { children: 'Analyse the twelve lots you shortlisted for twelve credits' },
};
