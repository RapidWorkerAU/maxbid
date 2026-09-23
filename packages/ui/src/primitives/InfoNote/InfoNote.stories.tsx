import type { Meta, StoryObj } from '@storybook/react-vite';
import { DS02, DS06, DS10, DS15, DS21 } from '@maxbid/content';
import { InfoNote } from './InfoNote';
import { Money } from '../Money/Money';
import { MonoLabel } from '../MonoLabel/MonoLabel';

const meta: Meta<typeof InfoNote> = {
  title: 'Primitives/InfoNote',
  component: InfoNote,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: { children: DS21 },
};
export default meta;

type Story = StoryObj<typeof InfoNote>;

export const Note: Story = {};
export const Warning: Story = { args: { tone: 'warning', children: DS15 } };
export const Expandable: Story = {
  args: { children: 'Estimate only, checked on 22 September 2026.', fullText: DS02 },
};
export const LongContent: Story = { args: { children: DS10 } };

export const BeneathTheFigureItQualifies: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6 text-ink">
      <div>
        <MonoLabel>Most you should bid</MonoLabel>
        <Money amount={7936.01} rounding="down" size="lg" />
        <InfoNote className="mt-1">{DS02}</InfoNote>
      </div>
      <div>
        <MonoLabel>Selling fees</MonoLabel>
        <Money amount={0} />
        <InfoNote className="mt-1" tone="warning">
          {DS15}
        </InfoNote>
      </div>
      <div>
        <MonoLabel>Proposed bid</MonoLabel>
        <Money amount={11800} />
        <InfoNote className="mt-1" tone="warning">
          {DS06}
        </InfoNote>
      </div>
    </div>
  ),
};

export const AtMobileWidth: Story = {
  ...BeneathTheFigureItQualifies,
  globals: { viewport: { value: 'mobile375' } },
};

export const AtDesktopWidth: Story = {
  ...BeneathTheFigureItQualifies,
  globals: { viewport: { value: 'desktop1440' } },
};
