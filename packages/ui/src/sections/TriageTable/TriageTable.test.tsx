import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TriageTable } from './TriageTable';
import { LOT_COLUMNS_NO_SHORTLIST, cellCountFor, type LotRowLot } from '../../composites/LotRow';

const lots: LotRowLot[] = [
  {
    id: '1',
    lotNumber: '0001-23502418',
    title: '2015 Invented Wagon Alpha Diesel',
    currentBid: 1609,
    identifiedAs: 'Invented Wagon, Alpha, 2015',
    confidence: 95,
  },
  {
    id: '2',
    lotNumber: '0002-23502418',
    title: '2014 Invented Hatch Beta Petrol',
    currentBid: 809,
    identifiedAs: 'Invented Hatch, Beta, 2014',
    confidence: 95,
  },
];

describe('the list of lots', () => {
  it('shows every lot', () => {
    render(<TriageTable lots={lots} />);
    expect(screen.getByText('0001-23502418')).toBeTruthy();
    expect(screen.getByText('0002-23502418')).toBeTruthy();
  });

  it('counts them, so the size of the sale is plain', () => {
    render(<TriageTable lots={lots} />);
    expect(screen.getByText('2 lots')).toBeTruthy();
  });

  it('uses the singular for one lot', () => {
    render(<TriageTable lots={[lots[0]!]} />);
    expect(screen.getByText('1 lot')).toBeTruthy();
  });

  it('shows the name of the sale when it has one', () => {
    render(<TriageTable lots={lots} caption="Invented Perth Motor Vehicle Auction" />);
    expect(
      screen.getByRole('heading', { name: 'Invented Perth Motor Vehicle Auction' }),
    ).toBeTruthy();
  });
});

describe('saying what is not here yet', () => {
  it('shows the note when there is one', () => {
    // SC05 asks for a resale range, an opportunity score and a rough maximum
    // bid. None exist yet, and a blank column would invite the reader to fill
    // it in themselves.
    render(<TriageTable lots={lots} pendingNote="The resale range is added later." />);
    expect(screen.getByText('The resale range is added later.')).toBeTruthy();
  });

  it('shows no note once there is nothing left to say', () => {
    render(<TriageTable lots={lots} />);
    expect(screen.queryByText(/added later/)).toBeNull();
  });
});

describe('shortlisting', () => {
  it('offers no checkboxes when the list does not shortlist', () => {
    render(<TriageTable lots={lots} />);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('offers one per lot when it does', () => {
    render(<TriageTable lots={lots} onSelect={() => {}} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('ticks the ones already chosen', () => {
    render(<TriageTable lots={lots} selected={['2']} onSelect={() => {}} />);
    const boxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(boxes[0]!.checked).toBe(false);
    expect(boxes[1]!.checked).toBe(true);
  });

  it('says how many are shortlisted', () => {
    render(<TriageTable lots={lots} selected={['1', '2']} onSelect={() => {}} />);
    expect(screen.getByText(/2 lots.*2 shortlisted/)).toBeTruthy();
  });

  it('says nothing about shortlisting when none are', () => {
    render(<TriageTable lots={lots} selected={[]} onSelect={() => {}} />);
    expect(screen.getByText('2 lots')).toBeTruthy();
  });

  it('reports which lot was chosen', () => {
    const onSelect = vi.fn();
    render(<TriageTable lots={lots} onSelect={onSelect} />);
    fireEvent.click(screen.getAllByRole('checkbox')[1]!);
    expect(onSelect).toHaveBeenCalledWith('2', true);
  });
});

describe('an empty catalogue', () => {
  it('says so in a sentence rather than showing an empty table', () => {
    render(<TriageTable lots={[]} />);
    expect(screen.getByText('No lots yet')).toBeTruthy();
  });

  it('says the page fills in while the analysis runs', () => {
    // Otherwise an empty list during extraction reads as a failure.
    render(<TriageTable lots={[]} />);
    expect(screen.getByText(/fills in as it goes/)).toBeTruthy();
  });

  it('counts nothing, because there is nothing to count', () => {
    render(<TriageTable lots={[]} />);
    expect(screen.queryByText(/0 lots/)).toBeNull();
  });
});

describe('the heading row lines up with the lots under it', () => {
  it('renders one heading cell per column', () => {
    // The Closes heading used to wrap onto a second line under Rank, because
    // there were ten headings and nine columns. Every heading was styled
    // correctly; there was simply one too many.
    const { container } = render(<TriageTable lots={lots} />);
    expect(container.querySelector('.sticky')!.children).toHaveLength(cellCountFor(false));
  });

  it('renders one more when the list shortlists', () => {
    const { container } = render(<TriageTable lots={lots} onSelect={() => {}} />);
    expect(container.querySelector('.sticky')!.children).toHaveLength(cellCountFor(true));
  });

  it('gives the heading row the same columns as the lots', () => {
    const { container } = render(<TriageTable lots={lots} />);
    const headings = container.querySelector('.sticky')!.className;
    const row = container.querySelectorAll('.relative')[0]!.className;
    expect(headings).toContain(LOT_COLUMNS_NO_SHORTLIST);
    expect(row).toContain(LOT_COLUMNS_NO_SHORTLIST);
  });
});

describe('linking each lot to its own screen', () => {
  it('links every lot when told where they live', () => {
    render(<TriageTable lots={lots} hrefFor={(id) => `/analysis/a1/lot/${id}`} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(lots.length);
    expect(links[0]!.getAttribute('href')).toBe('/analysis/a1/lot/1');
  });

  it('links nothing when there is nowhere to go', () => {
    render(<TriageTable lots={lots} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
