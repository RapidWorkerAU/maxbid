import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LotDetail, type LotDetailProps } from './LotDetail';

const base: LotDetailProps = {
  lot: {
    lotNumber: '0004-23502418',
    title: '2015 Invented Wagon Alpha Diesel',
    saleTitle: 'Motor vehicles, Perth',
    currentBid: 1609,
    identifiedAs: 'Invented Wagon, Alpha, 2015, diesel',
    identificationConfidence: 95,
  },
  valuation: { conservative: 14000, expected: 17500, optimistic: 21000, confidence: 62 },
  comparables: [
    {
      id: '1',
      title: '2015 Invented Wagon Alpha Diesel',
      price: 18500,
      matchLevel: 'exact',
      weight: 0.95,
      ageInDays: 30,
      source: 'Grays auction result',
      sold: true,
    },
  ],
  bids: { targetBid: 7936, limitBid: 10081, breakEvenBid: 11369 },
};

describe('what the screen shows', () => {
  it('names the lot and the sale it belongs to', () => {
    render(<LotDetail {...base} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      '2015 Invented Wagon Alpha Diesel',
    );
    expect(screen.getByText('0004-23502418')).toBeTruthy();
    expect(screen.getByText('Motor vehicles, Perth')).toBeTruthy();
  });

  it('shows the current bid, the resale range and the bid figures', () => {
    render(<LotDetail {...base} />);
    expect(screen.getByText('$1,609')).toBeTruthy();
    expect(screen.getByText('$14,000')).toBeTruthy();
    expect(screen.getByText('$21,000')).toBeTruthy();
    expect(screen.getByText('$7,936')).toBeTruthy();
  });

  it('shows the evidence on the page rather than behind a link', () => {
    // A resale range on its own is a number to be taken on trust. F59.
    render(<LotDetail {...base} />);
    expect(screen.getByText('$18,500')).toBeTruthy();
    expect(screen.getByText(/Sold price from Grays auction result/)).toBeTruthy();
  });

  it('says which end of the range the bid figures come from', () => {
    render(<LotDetail {...base} />);
    expect(screen.getByText(/cautious end is the honest one to plan from/)).toBeTruthy();
  });
});

describe('explaining the terms, as WR03 requires', () => {
  it("explains a buyer's premium where it first appears", () => {
    render(<LotDetail {...base} />);
    expect(screen.getByText(/fee the auction house adds to your winning bid/)).toBeTruthy();
  });

  it('explains what a comparable is, where there are none to show', () => {
    render(
      <LotDetail
        {...base}
        valuation={{ conservative: null, expected: null, optimistic: null }}
        comparables={[]}
      />,
    );
    expect(screen.getByText(/A comparable is a sale of the same or a similar item/)).toBeTruthy();
  });

  it('names the target bid as the most you should bid', () => {
    render(<LotDetail {...base} />);
    expect(screen.getByText('The most you should bid')).toBeTruthy();
  });
});

describe('when we cannot say', () => {
  it('says why there is no resale range rather than showing a blank', () => {
    render(
      <LotDetail
        {...base}
        valuation={{ conservative: null, expected: null, optimistic: null }}
        comparables={[]}
      />,
    );
    expect(screen.getByText(/could not find any sales of this item/)).toBeTruthy();
  });

  it('says a lot we could not identify has no range and no bid figure', () => {
    render(<LotDetail {...base} lot={{ ...base.lot, identifiedAs: null }} />);
    expect(screen.getByText(/could not work out what this lot is/)).toBeTruthy();
  });

  it('says no bids yet rather than a bid of nothing', () => {
    render(<LotDetail {...base} lot={{ ...base.lot, currentBid: null }} />);
    expect(screen.getByText('No bids yet')).toBeTruthy();
    expect(screen.queryByText('$0')).toBeNull();
  });
});

describe('the product rules', () => {
  it('never tells the reader whether to bid', () => {
    const { container } = render(<LotDetail {...base} />);
    const words = container.textContent!.toLowerCase();
    // We state facts about the lot and about their own figures. A verdict is
    // not ours to give and would implicate us in their decision.
    expect(words).not.toContain('you should bid on');
    expect(words).not.toContain('do not bid');
    expect(words).not.toContain('worth bidding');
    expect(words).not.toContain('good buy');
    expect(words).not.toContain('bargain');
    expect(words).not.toContain('recommend');
  });

  it('marks exactly one figure in marker yellow, the most you should bid', () => {
    // B09. On this screen there are three bid figures and a resale range, and
    // only one of them is an amount to act on.
    const { container } = render(<LotDetail {...base} />);
    const marked = container.querySelectorAll('.bg-accent');
    expect(marked).toHaveLength(1);
    expect(marked[0]!.textContent).toBe('$7,936');
  });

  it('has one first level heading and sections under it', () => {
    render(<LotDetail {...base} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(3);
  });

  it('uses no dashes in its copy, as the writing rules require', () => {
    const { container } = render(<LotDetail {...base} />);
    expect(container.textContent).not.toMatch(/[–—]/);
  });
});

describe('when we found sales but not enough of them', () => {
  const noRange = {
    ...base,
    valuation: { conservative: null, expected: null, optimistic: null },
  };

  it('says how many it found rather than implying none', () => {
    // A real run found four sales of a 1998 Landcruiser and showed "We have
    // not found any comparable sales for this lot yet". A reader who owns one
    // knows that is not true, and it reads as a broken product rather than a
    // careful one.
    render(<LotDetail {...noRange} />);
    expect(screen.getByText(/We found 1 possible comparable sale,/)).toBeTruthy();
    expect(screen.getByText(/not enough to put a resale figure/)).toBeTruthy();
  });

  it('counts in the plural when there is more than one', () => {
    const three = {
      ...noRange,
      comparables: [...Array(3)].map((_, i) => ({ ...base.comparables[0]!, id: `c${i}` })),
    };
    render(<LotDetail {...three} />);
    expect(screen.getByText(/We found 3 possible comparable sales/)).toBeTruthy();
  });

  it('still shows them, because they are the answer to why there is no figure', () => {
    render(<LotDetail {...noRange} />);
    expect(screen.getByText('$18,500')).toBeTruthy();
  });

  it('says plainly that it found nothing, where it found nothing', () => {
    render(<LotDetail {...noRange} comparables={[]} />);
    expect(screen.getByText(/could not find any sales of this item/)).toBeTruthy();
  });

  it('explains what a comparable is only where none were found', () => {
    // Where they are listed below, the list is the explanation.
    render(<LotDetail {...noRange} comparables={[]} />);
    expect(screen.getByText(/A comparable is a sale of the same or a similar item/)).toBeTruthy();
  });
});

describe('what it takes to win one, kept apart from what it resells for', () => {
  const withAuction = {
    ...base,
    valuation: {
      ...base.valuation,
      auctionMarket: { low: 11000, typical: 13000, high: 15000, results: 3 },
    },
  };

  it('shows the auction figure beside the current bid, not in the resale', () => {
    render(<LotDetail {...withAuction} />);
    expect(screen.getByText('What these usually fetch at auction')).toBeTruthy();
    expect(screen.getByText('$13,000')).toBeTruthy();
  });

  it('says plainly that it is not the resale figure', () => {
    // A hammer price is what a reseller paid to buy. A resale price is what
    // the public paid to own. Averaging the two removed the margin, which is
    // the thing the product exists to find.
    render(<LotDetail {...withAuction} />);
    expect(screen.getByText(/not the same as what it resells for/)).toBeTruthy();
  });

  it('says how many past sales it rests on, and their spread', () => {
    render(<LotDetail {...withAuction} />);
    expect(screen.getByText(/From 3 past sales/)).toBeTruthy();
    expect(screen.getByText(/\$11,000 and \$15,000/)).toBeTruthy();
  });

  it('uses the singular for one past sale', () => {
    render(
      <LotDetail
        {...withAuction}
        valuation={{
          ...withAuction.valuation,
          auctionMarket: { low: 13000, typical: 13000, high: 13000, results: 1 },
        }}
      />,
    );
    expect(screen.getByText(/From 1 past sale /)).toBeTruthy();
  });

  it('shows nothing where we have no past results', () => {
    render(<LotDetail {...base} />);
    expect(screen.queryByText('What these usually fetch at auction')).toBeNull();
  });

  it('shows it even when there is no resale range', () => {
    // It is often all we have, and it is worth knowing on its own.
    render(
      <LotDetail
        {...withAuction}
        valuation={{
          conservative: null,
          expected: null,
          optimistic: null,
          auctionMarket: { low: 11000, typical: 13000, high: 15000, results: 3 },
        }}
      />,
    );
    expect(screen.getByText('What these usually fetch at auction')).toBeTruthy();
  });

  it('never marks the auction figure in marker yellow', () => {
    // B09 reserves it for the main action and the most you should bid. This
    // is neither: it is what other people paid.
    const { container } = render(<LotDetail {...withAuction} />);
    const marked = container.querySelectorAll('.bg-accent');
    expect(marked).toHaveLength(1);
    expect(marked[0]!.textContent).toBe('$7,936');
  });
});

describe('correcting what we decided a lot is', () => {
  it('puts the correction under the identification it corrects', () => {
    render(<LotDetail {...base} correction={<button type="button">This is not right</button>} />);
    expect(screen.getByRole('button', { name: 'This is not right' })).toBeTruthy();
  });

  it('says a corrected identification is the reader own, and private', () => {
    // One organisation's opinion about a lot is not a fact about the lot, so
    // it would be wrong to let them think everybody now sees it.
    render(<LotDetail {...base} lot={{ ...base.lot, correctedByYou: true }} />);
    expect(screen.getByText(/This is what you told us it is/)).toBeTruthy();
    expect(screen.getByText(/nobody else analysing this sale sees/)).toBeTruthy();
  });

  it('says nothing of the sort where we worked it out ourselves', () => {
    render(<LotDetail {...base} />);
    expect(screen.queryByText(/This is what you told us it is/)).toBeNull();
  });
});

describe('setting a sale aside, and what that did', () => {
  const aside = {
    ...base,
    comparables: [
      base.comparables[0]!,
      {
        id: '2',
        title: '2015 Invented Wagon Alpha Petrol',
        price: 31500,
        matchLevel: 'exact' as const,
        weight: 0.95,
        ageInDays: 12,
        source: 'Grays auction result',
        sold: true,
        excludedReason: 'This one has the long wheelbase and this lot does not',
      },
    ],
  };

  it('puts a control on every sale, counted or not', () => {
    render(
      <LotDetail
        {...aside}
        exclusionFor={(comparable) => <button type="button">Set aside {comparable.id}</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Set aside 1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Set aside 2' })).toBeTruthy();
  });

  it('says how many they set aside, and that we left them out', () => {
    render(<LotDetail {...aside} />);
    expect(screen.getByText(/You have set 1 sale aside/)).toBeTruthy();
    expect(screen.getByText(/worked the figures above out without it/)).toBeTruthy();
  });

  it('counts in the plural for more than one', () => {
    const both = {
      ...aside,
      comparables: aside.comparables.map((c) => ({ ...c, excludedReason: 'Not this model' })),
    };
    render(<LotDetail {...both} />);
    expect(screen.getByText(/You have set 2 sales aside/)).toBeTruthy();
  });

  it('shows the standard wording for what the figures did', () => {
    // DS17, filled by the page. The component never types disclaimer text.
    const said = 'You excluded 1 comparable. The expected resale changed from $17,500 to $14,000.';
    render(<LotDetail {...aside} exclusionNote={said} />);
    expect(screen.getByText(said)).toBeTruthy();
  });

  it('says nothing of the sort where they set nothing aside', () => {
    render(<LotDetail {...base} />);
    expect(screen.queryByText(/You have set/)).toBeNull();
  });

  it('counts only the sales that counted when it explains a missing range', () => {
    // Telling a reader we found two sales and could not use them, when they
    // set one of the two aside themselves, reads as a broken product.
    render(
      <LotDetail {...aside} valuation={{ conservative: null, expected: null, optimistic: null }} />,
    );
    expect(screen.getByText(/We found 1 possible comparable sale,/)).toBeTruthy();
  });

  it('uses no dashes in the copy it adds', () => {
    const { container } = render(<LotDetail {...aside} />);
    expect(container.textContent).not.toMatch(/[–—]/);
  });
});
