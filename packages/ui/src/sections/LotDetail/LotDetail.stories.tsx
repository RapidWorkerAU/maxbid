import type { Meta, StoryObj } from '@storybook/react-vite';
import { LotDetail } from './LotDetail';

// Every figure comes from the real Grays Perth motor vehicle sale and the
// worked example in bid-calculation.md. Names are invented, because D44 keeps
// third party listing content out of the repository.
const comparables = [
  {
    id: '1',
    title: '2015 Invented Wagon Alpha Diesel, 180,000 km',
    price: 18500,
    matchLevel: 'exact' as const,
    weight: 0.95,
    ageInDays: 30,
    source: 'Grays auction result',
    sold: true,
  },
  {
    id: '2',
    title: '2016 Invented Wagon Alpha Diesel, 120,000 km',
    price: 24990,
    matchLevel: 'higherSpec' as const,
    weight: 0.54,
    ageInDays: 4,
    source: 'a dealer listing',
    sold: false,
    url: 'https://example.test/listing/2',
  },
  {
    id: '3',
    title: '2014 Invented Wagon Alpha Petrol, 210,000 km',
    price: 12000,
    matchLevel: 'similarAlternative' as const,
    weight: 0.21,
    ageInDays: 420,
    source: 'our own archive',
    sold: true,
  },
];

const meta: Meta<typeof LotDetail> = {
  title: 'Sections/LotDetail',
  component: LotDetail,
  tags: ['approved'],
  parameters: { layout: 'padded' },
  args: {
    lot: {
      lotNumber: '0004-23502418',
      title: '2015 Invented Wagon Alpha Diesel',
      saleTitle: 'Motor vehicles, Perth',
      currentBid: 1609,
      bidNote: 'We checked the current bids 14 minutes ago. A bid can rise at any time, so open the lot on the auction site before you bid.',
      identifiedAs: 'Invented Wagon, Alpha, 2015, diesel, odometer 180,000 km',
      identificationConfidence: 95,
      conditionNote: 'WOVR-INSPECTED',
    },
    valuation: { conservative: 14000, expected: 17500, optimistic: 21000, confidence: 62 },
    comparables,
    bids: { targetBid: 7936, limitBid: 10081, breakEvenBid: 11369 },
    method:
      'We took the cautious resale of $14,000, took off this auction’s buyer’s premium and GST, took off your costs, and took off the profit you said you want. The figure left is the most you can bid and still reach that profit.',
  },
};
export default meta;

type Story = StoryObj<typeof LotDetail>;

export const Default: Story = {};

/** F26. Not enough evidence, so no range, no bid figures, and a reason for both. */
export const NotEnoughEvidence: Story = {
  args: {
    valuation: { conservative: null, expected: null, optimistic: null },
    comparables: [],
    bids: { targetBid: null, limitBid: null, breakEvenBid: null },
    missingBidReason:
      'We could not find enough comparable sales to work out what this lot is worth, so we cannot work out a bid from it.',
    method: undefined,
  },
};

/** A lot the identification stage could not read. Nothing follows from it. */
export const NotIdentified: Story = {
  args: {
    lot: {
      lotNumber: '0031-23502418',
      title: 'PALLET OF ASSORTED ITEMS',
      saleTitle: 'Motor vehicles, Perth',
      currentBid: null,
      identifiedAs: null,
      conditionNote: null,
    },
    valuation: { conservative: null, expected: null, optimistic: null },
    comparables: [],
    bids: { targetBid: null, limitBid: null, breakEvenBid: null },
    missingBidReason:
      'We could not work out what this lot is, so there is nothing to compare it against.',
    method: undefined,
  },
};

/** A buyer whose cost profile is not filled in yet. Decision record 0022. */
export const NoCostProfileYet: Story = {
  args: {
    bids: { targetBid: null, limitBid: null, breakEvenBid: null },
    missingBidReason:
      'Tell us your costs and the profit you want, and we will work out the most you should bid.',
    method: undefined,
  },
};

/** One comparable only, which is below the evidence threshold. */
export const ThinEvidence: Story = {
  args: {
    valuation: { conservative: null, expected: null, optimistic: null },
    comparables: [comparables[0]!],
    bids: { targetBid: null, limitBid: null, breakEvenBid: null },
    missingBidReason:
      'We found one comparable sale, which is not enough to work out a resale range we would stand behind.',
    method: undefined,
  },
};
