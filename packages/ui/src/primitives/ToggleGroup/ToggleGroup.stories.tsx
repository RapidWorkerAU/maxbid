import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ToggleGroup } from './ToggleGroup';

const meta: Meta<typeof ToggleGroup> = {
  title: 'Primitives/ToggleGroup',
  component: ToggleGroup,
  tags: ['approved'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ToggleGroup>;

function GstExample() {
  const [value, setValue] = useState<'yes' | 'no'>('yes');
  return (
    <div className="w-full max-w-sm">
      <ToggleGroup
        legend="Registered for GST"
        value={value}
        onChange={setValue}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]}
      />
    </div>
  );
}

function ProfitModeExample() {
  const [value, setValue] = useState<'dollars' | 'percent'>('dollars');
  return (
    <div className="w-full max-w-sm">
      <ToggleGroup
        legend="Profit target set in"
        value={value}
        onChange={setValue}
        options={[
          { value: 'dollars', label: 'Dollars' },
          { value: 'percent', label: 'Return on cost' },
        ]}
      />
    </div>
  );
}

function ScenarioExample() {
  const [value, setValue] = useState('conservative');
  return (
    <div className="w-full max-w-lg">
      <ToggleGroup
        legend="Resale scenario"
        value={value}
        onChange={setValue}
        options={[
          { value: 'conservative', label: 'Conservative' },
          { value: 'expected', label: 'Expected' },
          { value: 'optimistic', label: 'Optimistic' },
        ]}
      />
    </div>
  );
}

export const GstRegistered: Story = { render: () => <GstExample /> };
export const ProfitMode: Story = { render: () => <ProfitModeExample /> };
export const ThreeChoices: Story = { render: () => <ScenarioExample /> };

export const EveryUse: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <GstExample />
      <ProfitModeExample />
      <ScenarioExample />
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...EveryUse,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...EveryUse,
  globals: { viewport: { value: 'desktop1440' } },
};
