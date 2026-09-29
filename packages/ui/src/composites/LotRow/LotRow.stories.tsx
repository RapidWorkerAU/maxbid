import type { Meta, StoryObj } from '@storybook/react-vite';
import { LotRow } from './LotRow';

// Every figure here comes from the real Grays Perth motor vehicle sale, except
// the names, which are invented because D44 keeps third party listing content
// out of the repository.
const meta: Meta<typeof LotRow> = {
  title: 'Composites/LotRow',
  component: LotRow,
  tags: ['in-review'],
  parameters: { layout: 'padded' },
  args: {
    lot: {
      id: '1',
      lotNumber: '0001-23502418',
      title: '2015 Invented Wagon Alpha Diesel',
      currentBid: 1609,
      closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString(),
      identifiedAs: 'Invented Wagon, Alpha, 2015, diesel',
      confidence: 95,
    },
  },
};
export default meta;

type Story = StoryObj<typeof LotRow>;

export const Default: Story = {};

export const WrittenOff: Story = {
  args: {
    lot: {
      id: '2',
      lotNumber: '0034-23502418',
      title: '2018 Invented Hatch Beta Petrol',
      currentBid: 4100,
      closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString(),
      identifiedAs: 'Invented Hatch, Beta, 2018, petrol',
      confidence: 95,
      conditionNote: 'WOVR-REPAIRABLE',
    },
  },
};

export const LessCertain: Story = {
  args: {
    lot: {
      id: '3',
      lotNumber: '0022-23502418',
      title: '2007 Invented Coupe',
      currentBid: 909,
      closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString(),
      identifiedAs: 'Invented Coupe, 2007',
      confidence: 42,
    },
  },
};

export const NotYetIdentified: Story = {
  // Before triage runs there is no identification and no confidence. The row
  // shows what the catalogue said and nothing more.
  args: {
    lot: {
      id: '4',
      lotNumber: '0007-23502418',
      title: '2013 Invented Sedan Gamma Diesel',
      currentBid: 1300,
      closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString(),
    },
  },
};

export const NoBidYet: Story = {
  args: {
    lot: {
      id: '5',
      lotNumber: '0012-23502418',
      title: '2011 Invented Van Delta Diesel',
      currentBid: null,
      closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString(),
      identifiedAs: 'Invented Van, Delta, 2011, diesel',
      confidence: 88,
    },
  },
};

export const ALongTitle: Story = {
  args: {
    lot: {
      id: '6',
      lotNumber: '0019-23502418',
      title:
        '2016 Invented Utility Epsilon Turbo Diesel Dual Cab Four Wheel Drive With Canopy And Towbar (WOVR-INSPECTED)',
      currentBid: 21700,
      closesAt: new Date(Date.now() + 26 * 3600_000).toISOString(),
      identifiedAs: 'Invented Utility, Epsilon, 2016, turbo diesel, dual cab, four wheel drive',
      confidence: 71,
      conditionNote: 'WOVR-INSPECTED',
    },
  },
};

export const Shortlisting: Story = {
  args: { selected: true, onSelect: () => {} },
};

export const Closed: Story = {
  args: {
    lot: {
      id: '7',
      lotNumber: '0003-23502418',
      title: '2009 Invented Wagon Zeta Petrol',
      currentBid: 3400,
      closesAt: new Date(Date.now() - 3600_000).toISOString(),
      identifiedAs: 'Invented Wagon, Zeta, 2009, petrol',
      confidence: 90,
    },
  },
};

export const ASaleOfThem: Story = {
  render: () => (
    <div className="border-t border-line">
      {[
        { id: 'a', lotNumber: '0001-23502418', title: '2015 Invented Wagon Alpha Diesel', currentBid: 1609, confidence: 95, identifiedAs: 'Invented Wagon, Alpha, 2015', conditionNote: 'WOVR-INSPECTED' },
        { id: 'b', lotNumber: '0002-23502418', title: '2014 Invented Hatch Beta Petrol', currentBid: 809, confidence: 95, identifiedAs: 'Invented Hatch, Beta, 2014' },
        { id: 'c', lotNumber: '0005-23502418', title: '2008 Invented Cruiser Gamma Diesel', currentBid: 11200, confidence: 90, identifiedAs: 'Invented Cruiser, Gamma, 2008' },
        { id: 'd', lotNumber: '0022-23502418', title: '2007 Invented Coupe', currentBid: 909, confidence: 42, identifiedAs: 'Invented Coupe, 2007' },
      ].map((lot) => (
        <LotRow
          key={lot.id}
          lot={{ ...lot, closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString() }}
          onSelect={() => {}}
        />
      ))}
    </div>
  ),
};

export const Comfortable: Story = { args: { density: 'comfortable' } };

/**
 * The layout check that the unit tests cannot do.
 *
 * Two rounds of this component shipped with green tests and a broken render:
 * the lot number wrapped onto two lines, the title was cut off at full
 * desktop width, and the identification overlapped the row below. Nothing in
 * a unit test looks at geometry, so this measures the real thing in a real
 * browser.
 */
export const FitsInOneRow: Story = {
  globals: { viewport: { value: 'desktop1440' } },
  args: {
    lot: {
      id: 'fit',
      lotNumber: '0001-23502418',
      title: '2016 Invented Utility Epsilon Turbo Diesel Dual Cab Four Wheel Drive With Canopy',
      currentBid: 21700,
      closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString(),
      identifiedAs: 'Invented Utility, Epsilon, 2016, turbo diesel, dual cab, four wheel drive',
      confidence: 71,
      conditionNote: 'WOVR-INSPECTED',
    },
    onSelect: () => {},
  },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('div[class*="grid"]') as HTMLElement;
    if (!row) throw new Error('The row did not render.');

    // A standard row is 36px and holds one line. Anything taller means
    // something wrapped.
    const height = row.getBoundingClientRect().height;
    if (height > 40) {
      throw new Error(`The row is ${Math.round(height)}px tall, so something wrapped into a second line.`);
    }

    // Nothing may spill sideways out of the row.
    if (row.scrollWidth > row.clientWidth + 1) {
      throw new Error(
        `The row overflows by ${row.scrollWidth - row.clientWidth}px, so a column is too narrow.`,
      );
    }

    // The lot number is an identifier. Half of one is no use, so it must sit
    // on one line and must not be cut short.
    const lotNumber = [...row.querySelectorAll('*')].find(
      (el) => el.textContent?.trim() === '0001-23502418',
    ) as HTMLElement | undefined;
    if (!lotNumber) throw new Error('The lot number did not render.');
    if (lotNumber.getBoundingClientRect().height > 24) {
      throw new Error('The lot number wrapped onto a second line.');
    }
    if (lotNumber.scrollWidth > lotNumber.clientWidth + 1) {
      throw new Error('The lot number is cut off, and half an identifier is no use.');
    }
  },
};

export const FitsOnAPhone: Story = {
  globals: { viewport: { value: 'mobile375' } },
  args: FitsInOneRow.args,
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('div[class*="grid"]') as HTMLElement;
    if (!row) throw new Error('The row did not render.');
    // A card may be as tall as it needs, but it must never scroll sideways.
    if (row.scrollWidth > row.clientWidth + 1) {
      throw new Error(`The card overflows by ${row.scrollWidth - row.clientWidth}px at 375px.`);
    }
  },
};

export const WithAResaleRange: Story = {
  args: {
    lot: {
      id: 'valued',
      lotNumber: '0005-23502418',
      title: '2008 Invented Cruiser Gamma Diesel',
      currentBid: 11300,
      closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString(),
      identifiedAs: 'Invented Cruiser, Gamma, 2008, diesel',
      confidence: 90,
      resaleLow: 8500,
      resaleHigh: 22500,
    },
  },
};

export const WithoutEnoughEvidence: Story = {
  // Most lots start here. Saying so is better than a blank cell, which reads
  // as a figure somebody forgot to fill in.
  args: {
    lot: {
      id: 'unvalued',
      lotNumber: '0006-23502418',
      title: '2011 Invented Hatch Delta Petrol',
      currentBid: 409,
      closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString(),
      identifiedAs: 'Invented Hatch, Delta, 2011, petrol',
      confidence: 95,
    },
  },
};

export const FullyValued: Story = {
  // Everything triage can produce: what it is, what it is bid to, what it is
  // worth, the most to pay, and where it ranks in the catalogue.
  args: {
    lot: {
      id: 'complete',
      lotNumber: '0005-23502418',
      title: '2008 Invented Cruiser Gamma Diesel',
      currentBid: 11300,
      closesAt: new Date(Date.now() + 6.5 * 3600_000).toISOString(),
      identifiedAs: 'Invented Cruiser, Gamma, 2008, diesel',
      confidence: 90,
      resaleLow: 8500,
      resaleHigh: 22500,
      maxBid: 5240,
      score: 100,
    },
    onSelect: () => {},
  },
};
