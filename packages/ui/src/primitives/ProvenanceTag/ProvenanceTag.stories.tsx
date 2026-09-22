import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProvenanceTag } from './ProvenanceTag';
import { Money } from '../Money/Money';
import { MonoLabel } from '../MonoLabel/MonoLabel';

const meta: Meta<typeof ProvenanceTag> = {
  title: 'Primitives/ProvenanceTag',
  component: ProvenanceTag,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: { provenance: 'verified' },
};
export default meta;

type Story = StoryObj<typeof ProvenanceTag>;

export const Verified: Story = {};
export const Extracted: Story = { args: { provenance: 'extracted' } };
export const Estimated: Story = { args: { provenance: 'estimated' } };
export const YourInput: Story = { args: { provenance: 'yourInput' } };

export const EveryTag: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ProvenanceTag provenance="verified" />
      <ProvenanceTag provenance="extracted" />
      <ProvenanceTag provenance="estimated" />
      <ProvenanceTag provenance="yourInput" />
    </div>
  ),
};

export const BesideAFigure: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-ink">
      <p className="max-w-md font-sans text-sm">
        Every figure carries one provenance tag, so a reader can always see
        where the number came from.
      </p>
      {[
        ['Conservative resale', 18500, 'estimated'],
        ['Last sold at auction', 16200, 'verified'],
        ['Your resale estimate', 19000, 'yourInput'],
      ].map(([label, amount, tag]) => (
        <div key={label as string} className="flex items-center gap-3">
          <div>
            <MonoLabel>{label as string}</MonoLabel>
            <Money amount={amount as number} />
          </div>
          <ProvenanceTag provenance={tag as 'verified'} />
        </div>
      ))}
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...BesideAFigure,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...BesideAFigure,
  globals: { viewport: { value: 'desktop1440' } },
};
