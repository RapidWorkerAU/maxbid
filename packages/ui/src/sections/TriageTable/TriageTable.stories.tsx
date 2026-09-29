import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TriageTable } from './TriageTable';
import type { LotRowLot } from '../../composites/LotRow';

// The shape of the real Grays Perth motor vehicle sale: 36 lots, most of them
// cheap, a few dear, four written off. The names are invented, because D44
// keeps third party listing content out of the repository.
const closesAt = new Date(Date.now() + 6.5 * 3600_000).toISOString();

const LOTS: LotRowLot[] = [
  { id: '1', lotNumber: '0001-23502418', title: '2015 Invented Wagon Alpha Diesel', currentBid: 1609, closesAt, identifiedAs: 'Invented Wagon, Alpha, 2015, diesel', confidence: 95, conditionNote: 'WOVR-INSPECTED' },
  { id: '2', lotNumber: '0002-23502418', title: '2014 Invented Hatch Beta Petrol', currentBid: 809, closesAt, identifiedAs: 'Invented Hatch, Beta, 2014, petrol', confidence: 95 },
  { id: '3', lotNumber: '0005-23502418', title: '2008 Invented Cruiser Gamma Diesel', currentBid: 11200, closesAt, identifiedAs: 'Invented Cruiser, Gamma, 2008, diesel', confidence: 90 },
  { id: '4', lotNumber: '0012-23502418', title: '2011 Invented Van Delta Diesel', currentBid: null, closesAt, identifiedAs: 'Invented Van, Delta, 2011, diesel', confidence: 88 },
  { id: '5', lotNumber: '0022-23502418', title: '2007 Invented Coupe', currentBid: 909, closesAt, identifiedAs: 'Invented Coupe, 2007', confidence: 42 },
  { id: '6', lotNumber: '0034-23502418', title: '2018 Invented Hatch Epsilon Petrol', currentBid: 4100, closesAt, identifiedAs: 'Invented Hatch, Epsilon, 2018, petrol', confidence: 95, conditionNote: 'WOVR-REPAIRABLE' },
  { id: '7', lotNumber: '0037-23502418', title: '2016 Invented Sedan Zeta Petrol', currentBid: 21700, closesAt, identifiedAs: 'Invented Sedan, Zeta, 2016, petrol', confidence: 95 },
];

const PENDING =
  'This list shows what each lot is and what it is bid to now. A rough resale range and the most you should bid are added once the valuation stage runs.';

const meta: Meta<typeof TriageTable> = {
  title: 'Sections/TriageTable',
  component: TriageTable,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: { lots: LOTS, caption: 'Invented Perth Motor Vehicle Auction', pendingNote: PENDING },
};
export default meta;

type Story = StoryObj<typeof TriageTable>;

export const Default: Story = {};

export const Shortlisting: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string[]>(['1']);
    return (
      <TriageTable
        {...args}
        selected={selected}
        onSelect={(id, on) =>
          setSelected((was) => (on ? [...was, id] : was.filter((each) => each !== id)))
        }
      />
    );
  },
};

export const BeforeTriageHasRun: Story = {
  // Straight after extraction there is no identification and no confidence.
  args: {
    lots: LOTS.map((lot) => ({
      ...lot,
      identifiedAs: null,
      confidence: null,
      conditionNote: null,
    })),
    pendingNote:
      'We have read the catalogue. We are still working out what each lot is, and this list fills in as we go.',
  },
};

export const OneLot: Story = { args: { lots: [LOTS[0]!] } };

export const NoLots: Story = { args: { lots: [] } };

export const WithoutTheNote: Story = { args: { pendingNote: undefined } };

export const ALongSale: Story = {
  // Forty lots, to see the row rhythm at length and check nothing drifts.
  args: {
    lots: Array.from({ length: 40 }, (_, index) => ({
      ...LOTS[index % LOTS.length]!,
      id: `long-${index}`,
      lotNumber: `${String(index + 1).padStart(4, '0')}-23502418`,
    })),
  },
};

export const ComfortableDensity: Story = {
  // C09. The same table at 44px rows instead of 36px, through one token.
  args: { density: 'comfortable' },
};

export const BothDensities: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      <TriageTable {...args} density="standard" pendingNote={undefined} caption="Standard, 36px rows" />
      <TriageTable {...args} density="comfortable" pendingNote={undefined} caption="Comfortable, 44px rows" />
    </div>
  ),
};

export const StickyHeader: Story = {
  // The heading row stays put while a long sale scrolls under it.
  args: {
    lots: Array.from({ length: 40 }, (_, index) => ({
      ...LOTS[index % LOTS.length]!,
      id: `sticky-${index}`,
      lotNumber: `${String(index + 1).padStart(4, '0')}-23502418`,
    })),
    pendingNote: undefined,
  },
  render: (args) => (
    // A scrollable box needs keyboard access, or someone who cannot use a
    // mouse cannot reach what is below the fold. The accessibility check
    // caught this on the first version of this story.
    <div
      className="h-96 overflow-y-auto"
      tabIndex={0}
      role="region"
      aria-label="Scrollable list of lots"
    >
      <TriageTable {...args} />
    </div>
  ),
};
