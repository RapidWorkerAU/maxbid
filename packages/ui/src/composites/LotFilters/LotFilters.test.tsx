import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LotFilters } from './LotFilters';
import controlsSource from './LotFilters.tsx?raw';
import rulesSource from './filters.ts?raw';
import {
  NO_FILTERS,
  filtersFromParams,
  locationsIn,
  matchesFilters,
  paramsFromFilters,
} from './filters';

const NOW = new Date('2026-10-22T12:00:00.000Z');
const closesIn = (hours: number) => new Date(NOW.getTime() + hours * 3_600_000).toISOString();

describe('what a filter may hide', () => {
  it('keeps a lot we could not value, whatever the value filter says', () => {
    // We do not know that it falls outside their range. We know we could not
    // say. Dropping it quietly would be us deciding what they get to see.
    const unvalued = { maxBid: null };
    expect(matchesFilters(unvalued, { ...NO_FILTERS, minMaxBid: 5000 }, NOW)).toBe(true);
  });

  it('hides one only when the reader turns it off themselves', () => {
    const unvalued = { maxBid: null };
    expect(matchesFilters(unvalued, { ...NO_FILTERS, includeUnvalued: false }, NOW)).toBe(false);
  });

  it('shows everything when nothing is set', () => {
    expect(matchesFilters({ maxBid: null, closesAt: null, location: null }, NO_FILTERS, NOW)).toBe(
      true,
    );
  });
});

describe('filtering on what a lot is worth bidding', () => {
  it('keeps a lot at or above the floor', () => {
    expect(matchesFilters({ maxBid: 5000 }, { ...NO_FILTERS, minMaxBid: 5000 }, NOW)).toBe(true);
    expect(matchesFilters({ maxBid: 9000 }, { ...NO_FILTERS, minMaxBid: 5000 }, NOW)).toBe(true);
  });

  it('drops a valued lot below it', () => {
    expect(matchesFilters({ maxBid: 4999 }, { ...NO_FILTERS, minMaxBid: 5000 }, NOW)).toBe(false);
  });

  it('drops a lot worth nothing to this buyer, which is a real answer', () => {
    expect(matchesFilters({ maxBid: 0 }, { ...NO_FILTERS, minMaxBid: 1 }, NOW)).toBe(false);
  });
});

describe('filtering on when a lot closes', () => {
  it('keeps one closing inside the window', () => {
    const lot = { maxBid: 5000, closesAt: closesIn(5) };
    expect(matchesFilters(lot, { ...NO_FILTERS, closingWithinHours: 6 }, NOW)).toBe(true);
  });

  it('drops one closing after it', () => {
    const lot = { maxBid: 5000, closesAt: closesIn(30) };
    expect(matchesFilters(lot, { ...NO_FILTERS, closingWithinHours: 6 }, NOW)).toBe(false);
  });

  it('keeps one that has already closed, because it is still in the sale', () => {
    const lot = { maxBid: 5000, closesAt: closesIn(-2) };
    expect(matchesFilters(lot, { ...NO_FILTERS, closingWithinHours: 6 }, NOW)).toBe(true);
  });

  it('drops one with no closing time, because we cannot say it is inside', () => {
    const lot = { maxBid: 5000, closesAt: null };
    expect(matchesFilters(lot, { ...NO_FILTERS, closingWithinHours: 6 }, NOW)).toBe(false);
    expect(matchesFilters(lot, NO_FILTERS, NOW)).toBe(true);
  });
});

describe('filtering on where a lot is', () => {
  it('keeps a lot in the chosen place', () => {
    const lot = { maxBid: 5000, location: 'Altona North, VIC' };
    expect(matchesFilters(lot, { ...NO_FILTERS, location: 'Altona North, VIC' }, NOW)).toBe(true);
  });

  it('drops a lot somewhere else', () => {
    const lot = { maxBid: 5000, location: 'Wingfield, SA' };
    expect(matchesFilters(lot, { ...NO_FILTERS, location: 'Altona North, VIC' }, NOW)).toBe(false);
  });

  it('drops a lot we have no location for, rather than guessing', () => {
    const lot = { maxBid: 5000, location: null };
    expect(matchesFilters(lot, { ...NO_FILTERS, location: 'Altona North, VIC' }, NOW)).toBe(false);
  });
});

describe('the places a catalogue offers', () => {
  it('lists each one once, in order', () => {
    const lots = [
      { location: 'Wingfield, SA' },
      { location: 'Altona North, VIC' },
      { location: 'Wingfield, SA' },
      { location: null },
    ];
    expect(locationsIn(lots)).toEqual(['Altona North, VIC', 'Wingfield, SA']);
  });

  it('offers nothing where no lot has a location', () => {
    expect(locationsIn([{ location: null }, {}])).toEqual([]);
  });
});

describe('the filters on screen', () => {
  const showing = { shown: 4, total: 13 };

  it('says how many lots it is showing, and that the rest are still there', () => {
    render(
      <LotFilters filters={NO_FILTERS} onChange={() => {}} locations={[]} showing={showing} />,
    );
    expect(screen.getByText(/Showing 4 of 13 lots/)).toBeTruthy();
    expect(screen.getByText(/still in this catalogue/)).toBeTruthy();
  });

  it('says so plainly when it is showing everything', () => {
    render(
      <LotFilters
        filters={NO_FILTERS}
        onChange={() => {}}
        locations={[]}
        showing={{ shown: 13, total: 13 }}
      />,
    );
    expect(screen.getByText('Showing all 13 lots.')).toBeTruthy();
  });

  it('offers a place only where the catalogue has more than one', () => {
    const { rerender } = render(
      <LotFilters
        filters={NO_FILTERS}
        onChange={() => {}}
        locations={['Altona North, VIC']}
        showing={showing}
      />,
    );
    expect(screen.queryByText('Where it is')).toBeNull();

    rerender(
      <LotFilters
        filters={NO_FILTERS}
        onChange={() => {}}
        locations={['Altona North, VIC', 'Wingfield, SA']}
        showing={showing}
      />,
    );
    expect(screen.getByText('Where it is')).toBeTruthy();
  });

  it('starts by showing the lots we could not value', () => {
    render(
      <LotFilters filters={NO_FILTERS} onChange={() => {}} locations={[]} showing={showing} />,
    );
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', true);
  });

  it('reports a change rather than holding it', () => {
    const onChange = vi.fn();
    render(
      <LotFilters filters={NO_FILTERS} onChange={onChange} locations={[]} showing={showing} />,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith({ ...NO_FILTERS, includeUnvalued: false });
  });

  it('treats an emptied amount as no floor, not as nought', () => {
    const onChange = vi.fn();
    render(
      <LotFilters
        filters={{ ...NO_FILTERS, minMaxBid: 5000 }}
        onChange={onChange}
        locations={[]}
        showing={showing}
      />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith({ ...NO_FILTERS, minMaxBid: null });
  });
});

describe('filters in the query string', () => {
  it('reads every filter back out of a link', () => {
    expect(
      filtersFromParams({ min: '5000', closing: '24', where: 'Wingfield, SA', unvalued: 'no' }),
    ).toEqual({
      minMaxBid: 5000,
      closingWithinHours: 24,
      location: 'Wingfield, SA',
      includeUnvalued: false,
    });
  });

  it('reads an empty query as no filters at all', () => {
    expect(filtersFromParams({})).toEqual(NO_FILTERS);
  });

  it('shows the lots we could not value unless the link says not to', () => {
    // The safe reading of a filter we do not understand is the one that hides
    // nothing, because hiding is the part we cannot take back.
    expect(filtersFromParams({ unvalued: 'yes' }).includeUnvalued).toBe(true);
    expect(filtersFromParams({ unvalued: 'rubbish' }).includeUnvalued).toBe(true);
    expect(filtersFromParams({ unvalued: 'no' }).includeUnvalued).toBe(false);
  });

  it('ignores a number it cannot read rather than filtering on nonsense', () => {
    expect(filtersFromParams({ min: 'lots' }).minMaxBid).toBeNull();
    expect(filtersFromParams({ min: '' }).minMaxBid).toBeNull();
  });

  it('writes only what has been set', () => {
    // A query string full of empty values is noise in a link somebody is
    // about to send.
    expect(paramsFromFilters(NO_FILTERS).toString()).toBe('');
  });

  it('survives a trip out to a link and back', () => {
    const filters = {
      minMaxBid: 5000,
      closingWithinHours: 6,
      location: 'Altona North, VIC',
      includeUnvalued: false,
    };
    const params = paramsFromFilters(filters);
    expect(filtersFromParams(Object.fromEntries(params))).toEqual(filters);
  });

  it('keeps a floor of nought, which is a real choice', () => {
    const params = paramsFromFilters({ ...NO_FILTERS, minMaxBid: 0 });
    expect(filtersFromParams(Object.fromEntries(params)).minMaxBid).toBe(0);
  });
});

describe('which side of the client boundary the rules live on', () => {
  it('keeps use client off the rules file', () => {
    // A server page reads the filters out of the query string before it
    // renders. Everything exported from a module with use client on it is a
    // client export, so putting these next to the controls made that fail at
    // runtime with "attempted to call it from the server".
    //
    // Nothing else catches it. Unit tests do not enforce the boundary and the
    // story tests render in a browser where everything is a client, so only
    // opening the page did.
    // The directive, not the words. This file explains the boundary in a
    // comment, and a test that matched the prose would fail on the
    // explanation of why it must not be there.
    // The directive, not the words. This file explains the boundary in a
    // comment, and a test that matched the prose would fail on the
    // explanation of why the directive must not be there.
    expect(rulesSource.trimStart().startsWith('"use client"')).toBe(false);
    expect(rulesSource.trimStart().startsWith("'use client'")).toBe(false);
  });

  it('keeps use client on the controls, which need it', () => {
    expect(controlsSource.startsWith("'use client'")).toBe(true);
  });
});
