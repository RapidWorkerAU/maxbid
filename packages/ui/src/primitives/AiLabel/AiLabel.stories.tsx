import type { Meta, StoryObj } from '@storybook/react-vite';
import { DS13, DS33 } from '@maxbid/content';
import { AiLabel } from './AiLabel';
import { ProvenanceTag } from '../ProvenanceTag/ProvenanceTag';

const meta: Meta<typeof AiLabel> = {
  title: 'Primitives/AiLabel',
  component: AiLabel,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof AiLabel>;

export const Default: Story = {};
export const WithMatchReason: Story = { args: { detail: DS33 } };
export const WithIdentificationNote: Story = { args: { detail: DS13 } };

export const BesideAProvenanceTag: Story = {
  render: () => (
    <div className="flex flex-col gap-3 font-sans text-sm text-ink">
      <p className="max-w-md">
        The AI label sits alongside the provenance tag and never replaces it,
        so a reader sees both where the figure came from and that a model
        produced the words.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <ProvenanceTag provenance="estimated" />
        <AiLabel />
      </div>
      <AiLabel detail={DS33} />
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...BesideAProvenanceTag,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...BesideAProvenanceTag,
  globals: { viewport: { value: 'desktop1440' } },
};
