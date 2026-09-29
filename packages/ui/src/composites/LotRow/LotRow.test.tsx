import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LotRow, closesIn, type LotRowLot } from './LotRow';

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
