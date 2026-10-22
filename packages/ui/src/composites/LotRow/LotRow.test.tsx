import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LOT_CELL_COUNT, LOT_COLUMNS, LotRow, closesIn, type LotRowLot } from './LotRow';

const lot: LotRowLot = {
  id: '1',
  lotNumber: '0001-23502418',
  title: '2015 Invented Wagon Alpha Diesel',
  currentBid: 1609,
  identifiedAs: 'Invented Wagon, Alpha, 2015, diesel',
  confidence: 95,
};

describe('what the row shows', () => {
  it('shows the lot number the auction uses', () => {
    render(<LotRow lot={lot} />);
    expect(screen.getByText('0001-23502418')).toBeTruthy();
  });

  it('shows the catalogue title and what we decided it is', () => {
    render(<LotRow lot={lot} />);
    expect(screen.getByText('2015 Invented Wagon Alpha Diesel')).toBeTruthy();
    expect(screen.getByText('Invented Wagon, Alpha, 2015, diesel')).toBeTruthy();
  });

  it('shows the current bid as money', () => {
    render(<LotRow lot={lot} />);
    expect(screen.getByText('$1,609')).toBeTruthy();
  });

  it('says there is no bid rather than showing a zero', () => {
    // A zero would read as a lot nobody wants at any price, which is not the
    // same thing as a lot nobody has bid on yet.
    render(<LotRow lot={{ ...lot, currentBid: null }} />);
    expect(screen.getByText('No bid yet')).toBeTruthy();
    expect(screen.queryByText('$0')).toBeNull();
  });

  it('shows the confidence as a labelled band, not a bare number', () => {
    render(<LotRow lot={lot} />);
    expect(screen.getByText('High confidence')).toBeTruthy();
  });

  it('leaves the confidence out entirely before triage has run', () => {
    render(<LotRow lot={{ ...lot, confidence: null, identifiedAs: null }} />);
    expect(screen.queryByText(/confidence/i)).toBeNull();
  });

  it('shows a written off marker in the catalogue own words', () => {
    // WOVR-INSPECTED and WOVR-REPAIRABLE are not the same thing, so neither is
    // tidied into a single label.
    render(<LotRow lot={{ ...lot, conditionNote: 'WOVR-REPAIRABLE' }} />);
    expect(screen.getByText('WOVR-REPAIRABLE')).toBeTruthy();
  });
});

describe('shortlisting', () => {
  it('shows no checkbox when the list does not shortlist', () => {
    render(<LotRow lot={lot} />);
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('names what is being shortlisted, not just the number', () => {
    render(<LotRow lot={lot} onSelect={() => {}} />);
    expect(
      screen.getByRole('checkbox', { name: /shortlist lot 0001-23502418, 2015 Invented Wagon/i }),
    ).toBeTruthy();
  });

  it('reports the lot and the new state when it is ticked', () => {
    const onSelect = vi.fn();
    render(<LotRow lot={lot} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onSelect).toHaveBeenCalledWith('1', true);
  });

  it('reports false when it is unticked', () => {
    const onSelect = vi.fn();
    render(<LotRow lot={lot} selected onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onSelect).toHaveBeenCalledWith('1', false);
  });
});

describe('how long until it closes', () => {
  const now = new Date('2026-09-29T04:00:00.000Z');

  it('counts in days when there is more than one', () => {
    expect(closesIn('2026-10-01T10:00:00.000Z', now)).toBe('Closes in 2 days');
  });

  it('counts in hours within a day', () => {
    expect(closesIn('2026-09-29T10:30:00.000Z', now)).toBe('Closes in 6 hours');
  });

  it('counts in minutes within an hour', () => {
    expect(closesIn('2026-09-29T04:25:00.000Z', now)).toBe('Closes in 25 minutes');
  });

  it('uses the singular where there is one of something', () => {
    expect(closesIn('2026-09-30T05:00:00.000Z', now)).toBe('Closes in 1 day');
    expect(closesIn('2026-09-29T05:30:00.000Z', now)).toBe('Closes in 1 hour');
    expect(closesIn('2026-09-29T04:01:30.000Z', now)).toBe('Closes in 1 minute');
  });

  it('says closed rather than counting backwards', () => {
    expect(closesIn('2026-09-29T03:00:00.000Z', now)).toBe('Closed');
  });

  it('says nothing at all when the time cannot be read', () => {
    expect(closesIn('not a time', now)).toBe('');
  });
});

describe('what we think it is worth', () => {
  it('shows the range as money', () => {
    render(<LotRow lot={{ ...lot, resaleLow: 8500, resaleHigh: 22500 }} />);
    expect(screen.getByText('$8,500')).toBeTruthy();
    expect(screen.getByText('$22,500')).toBeTruthy();
  });

  it('says there is not enough evidence rather than leaving a blank', () => {
    // A blank cell reads as a figure somebody forgot to fill in. Most lots
    // have no range, so this is the common case and has to say so plainly.
    render(<LotRow lot={lot} />);
    expect(screen.getByText('Not enough evidence')).toBeTruthy();
  });

  it('needs both ends before it shows anything', () => {
    // Half a range is not a range, and one figure on its own would be read
    // as a single estimate.
    render(<LotRow lot={{ ...lot, resaleLow: 8500 }} />);
    expect(screen.getByText('Not enough evidence')).toBeTruthy();
  });
});

describe('the most you should bid', () => {
  it('shows it as a figure rounded down', () => {
    // Decision record 0003. A bid figure is never rounded up, because that
    // would advise a bid the evidence does not support.
    render(<LotRow lot={{ ...lot, maxBid: 8499.99 }} />);
    expect(screen.getByText('$8,499')).toBeTruthy();
  });

  it('says it has not been worked out rather than showing nothing', () => {
    render(<LotRow lot={lot} />);
    expect(screen.getByText('Not worked out')).toBeTruthy();
  });

  it('says a lot is below the user target rather than judging it', () => {
    // A figure of nothing means the lot cannot carry their own profit target
    // at any price. That is a fact about their target. "Not worth bidding"
    // would be a recommendation about their money, and MaxBid does not make
    // those.
    render(<LotRow lot={{ ...lot, maxBid: 0 }} />);
    expect(screen.getByText('Below your target')).toBeTruthy();
  });

  it('never tells the user whether to bid', () => {
    render(<LotRow lot={{ ...lot, maxBid: 0 }} />);
    expect(screen.queryByText(/worth bidding/i)).toBeNull();
    expect(screen.queryByText(/do not bid/i)).toBeNull();
  });

  it('shows the rank when the catalogue has been scored', () => {
    render(<LotRow lot={{ ...lot, score: 100 }} />);
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('shows no rank before the catalogue is scored', () => {
    render(<LotRow lot={lot} />);
    expect(screen.queryByText('100')).toBeNull();
  });
});

describe('linking to the lot', () => {
  it('links the title when there is somewhere to go', () => {
    render(<LotRow lot={lot} href="/analysis/a1/lot/l1" />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/analysis/a1/lot/l1');
    expect(link.textContent).toBe('2015 Invented Wagon Alpha Diesel');
  });

  it('shows the title as plain text when there is nowhere to go', () => {
    render(<LotRow lot={lot} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('links the title rather than the whole row', () => {
    // A whole row link would swallow the shortlist checkbox and would
    // navigate away when a reader drags to select a figure.
    render(<LotRow lot={lot} href="/analysis/a1/lot/l1" onSelect={() => {}} />);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('checkbox')).toBeTruthy();
  });

  it('keeps the title on one line even as a link', () => {
    render(<LotRow lot={lot} href="/analysis/a1/lot/l1" />);
    expect(screen.getByRole('link').className).toContain('truncate');
  });
});

describe('the row and its heading line up', () => {
  // There were ten cells and nine columns, so the tenth wrapped onto a second
  // implicit row: the Closes heading sat under Rank, and every lot's closing
  // time sat on a line of its own under the row it belonged to. Counting is
  // what catches that, because every cell was styled correctly.
  it('declares as many columns as a row has cells', () => {
    const columns = LOT_COLUMNS.match(/\[(.+)\]/)![1]!.split('_').length;
    expect(columns).toBe(LOT_CELL_COUNT);
  });

  it('renders exactly that many cells, shortlist or not', () => {
    const { container } = render(<LotRow lot={lot} />);
    const row = container.firstElementChild!;
    expect(row.children).toHaveLength(LOT_CELL_COUNT);
  });

  it('renders the same number when the list shortlists', () => {
    const { container } = render(<LotRow lot={lot} onSelect={() => {}} />);
    expect(container.firstElementChild!.children).toHaveLength(LOT_CELL_COUNT);
  });

  it('keeps the count when a lot has no closing time or score', () => {
    const bare = { id: '2', lotNumber: '0002-1', title: 'A lot' };
    const { container } = render(<LotRow lot={bare} />);
    expect(container.firstElementChild!.children).toHaveLength(LOT_CELL_COUNT);
  });
});

describe('opening a lot from the row', () => {
  it('stretches the title link across the whole row', () => {
    // A reader expects to click anywhere on the row. One real link stretched
    // by its own ::after does that without putting a checkbox inside a link
    // and without a click handler the keyboard cannot reach.
    render(<LotRow lot={lot} href="/analysis/a1/lot/l1" />);
    expect(screen.getByRole('link').className).toContain('after:inset-0');
  });

  it('positions the row so the stretched link has something to cover', () => {
    const { container } = render(<LotRow lot={lot} href="/analysis/a1/lot/l1" />);
    expect(container.firstElementChild!.className).toContain('relative');
  });

  it('keeps one thing in the tab order, not ten', () => {
    render(<LotRow lot={lot} href="/analysis/a1/lot/l1" />);
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('keeps the checkbox above the stretched link', () => {
    // Otherwise shortlisting a lot would open it instead.
    render(<LotRow lot={lot} href="/analysis/a1/lot/l1" onSelect={() => {}} />);
    expect(screen.getByRole('checkbox').className).toContain('z-10');
  });
});

describe('a cell that is still being worked out', () => {
  // "Not enough evidence" on a lot the valuation stage has not reached is a
  // claim about work we have not done. These are different statements and the
  // row has to tell them apart.
  it('says it is working rather than that there is no evidence', () => {
    render(<LotRow lot={{ ...lot, pending: 'valuation' }} />);
    expect(screen.getAllByText('Working it out').length).toBeGreaterThan(0);
    expect(screen.queryByText('Not enough evidence')).toBeNull();
    expect(screen.queryByText('Not worked out')).toBeNull();
  });

  it('says there is no evidence once the stage has run', () => {
    render(<LotRow lot={{ ...lot, pending: null }} />);
    expect(screen.getByText('Not enough evidence')).toBeTruthy();
    expect(screen.queryByText('Working it out')).toBeNull();
  });

  it('says it is working on the name while the identification runs', () => {
    render(<LotRow lot={{ ...lot, identifiedAs: null, pending: 'identification' }} />);
    expect(screen.getAllByText('Working it out').length).toBeGreaterThan(0);
  });

  it('never covers a figure it already has', () => {
    // A lot part way through still shows what we know. Hiding a real figure
    // behind a wait would be worse than the wait.
    render(<LotRow lot={{ ...lot, resaleLow: 14000, resaleHigh: 21000, pending: 'valuation' }} />);
    expect(screen.getByText(/\$14,000/)).toBeTruthy();
  });

  it('never marks a pending cell in marker yellow', () => {
    const { container } = render(<LotRow lot={{ ...lot, pending: 'valuation' }} />);
    expect(container.querySelectorAll('.bg-marker')).toHaveLength(0);
  });
});
