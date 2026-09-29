import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TriageTable } from './TriageTable';
import type { LotRowLot } from '../../composites/LotRow';

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
    expect(screen.getByRole('heading', { name: 'Invented Perth Motor Vehicle Auction' })).toBeTruthy();
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
    expect(screen.getByText('2 lots, 2 shortlisted')).toBeTruthy();
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
