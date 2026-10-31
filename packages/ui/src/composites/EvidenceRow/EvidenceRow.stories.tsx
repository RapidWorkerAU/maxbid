import type { Meta, StoryObj } from '@storybook/react-vite';
import { EvidenceRow } from './EvidenceRow';

// Names are invented because D44 keeps third party listing content out of the
// repository. The weights are the real ones from decision record 0020.
const meta: Meta<typeof EvidenceRow> = {
  title: 'Composites/EvidenceRow',
  component: EvidenceRow,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: {
    comparable: {
      id: '1',
      title: '2015 Invented Wagon Alpha Diesel, 180,000 km',
      price: 18500,
      matchLevel: 'exact',
      weight: 0.95,
      ageInDays: 30,
      source: 'Grays auction result',
      sold: true,
    },
  },
};
export default meta;

type Story = StoryObj<typeof EvidenceRow>;

export const SoldAtAuction: Story = {};

/** An advertised price, weighted 0.6 against 0.95 for a sold one. */
export const StillForSale: Story = {
  args: {
    comparable: {
      id: '2',
      title: '2016 Invented Wagon Alpha Diesel, 120,000 km',
      price: 24990,
      matchLevel: 'higherSpec',
      weight: 0.6,
      ageInDays: 4,
      source: 'a dealer listing',
      sold: false,
      url: 'https://example.test/listing/2',
    },
  },
};

/** An old price. The age is what decides how much the recency decay removes. */
export const YearsOld: Story = {
  args: {
    comparable: {
      id: '3',
      title: '2014 Invented Wagon Alpha Petrol',
      price: 12000,
      matchLevel: 'similarAlternative',
      weight: 0.21,
      ageInDays: 800,
      source: 'our own archive',
      sold: true,
    },
  },
};

/** A title long enough to break a row, which is how LotRow was first broken. */
export const VeryLongTitle: Story = {
  args: {
    comparable: {
      id: '4',
      title:
        '2015 Invented Wagon Alpha Diesel Automatic Four Wheel Drive Seven Seat Wagon With Towbar, Bull Bar, Roof Racks And Long Range Fuel Tank',
      price: 18500,
      matchLevel: 'nearExact',
      weight: 0.86,
      ageInDays: 45,
      source: 'Grays auction result',
      sold: true,
      url: 'https://example.test/listing/4',
    },
  },
};

/**
 * F21. The reason is the part a reader uses to disagree with us. A match
 * level on its own is a verdict with the reasoning left out.
 */
export const WithTheReasonItCounted: Story = {
  args: {
    comparable: {
      id: '5',
      title: '2016 Invented Wagon Alpha Diesel, 120,000 km',
      price: 24990,
      matchLevel: 'higherSpec',
      weight: 0.54,
      ageInDays: 4,
      source: 'a dealer listing',
      sold: false,
      url: 'https://example.test/listing/5',
      reason:
        'Same model and body, one year newer with 60,000 km fewer on it, so it should sell for more than this lot.',
    },
  },
};

/** A reason long enough to wrap, which it should rather than truncate. */
export const ALongReason: Story = {
  args: {
    comparable: {
      id: '6',
      title: '2014 Invented Wagon Alpha Petrol',
      price: 12000,
      matchLevel: 'similarAlternative',
      weight: 0.21,
      ageInDays: 800,
      source: 'our own archive',
      sold: true,
      reason:
        'Same make and a similar body, but a petrol engine rather than a diesel, an earlier model year, and no service history stated. It is the right kind of vehicle rather than the same vehicle, so it counts for less than a quarter of an exact match.',
    },
  },
};
