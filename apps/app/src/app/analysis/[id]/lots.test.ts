import { describe, expect, it } from 'vitest';
import {
  bidFreshnessNote,
  bidsCheckedNoteFor,
  describeIdentification,
  pendingNoteFor,
  toRows,
} from './lots';

const lot = {
  id: 'lot-1',
  lot_number: '0001-23502418',
  title: '2015 Invented Wagon Alpha Diesel',
  current_bid: '1609.00',
  closes_at: '2026-09-29T11:30:00.000Z',
};

const identification = {
  lot_id: 'lot-1',
  brand: 'Invented',
  model: 'Wagon Alpha',
  year: 2015,
  confidence: '95.00',
  condition_notes: 'WOVR-INSPECTED',
};

describe('joining a lot to what triage decided', () => {
  it('carries what the catalogue said', () => {
    const [row] = toRows([lot], []);
    expect(row).toMatchObject({
      lotNumber: '0001-23502418',
      title: '2015 Invented Wagon Alpha Diesel',
      currentBid: 1609,
    });
  });

  it('turns the database numerics into numbers', () => {
    // Postgres numerics come back as strings, and Money needs a number.
    const [row] = toRows([lot], [identification]);
    expect(row?.currentBid).toBe(1609);
    expect(row?.confidence).toBe(95);
  });

  it('carries what triage decided', () => {
    const [row] = toRows([lot], [identification]);
    expect(row?.identifiedAs).toBe('2015 Invented Wagon Alpha');
    expect(row?.conditionNote).toBe('WOVR-INSPECTED');
  });

  it('leaves a lot triage has not reached as unidentified', () => {
    const [row] = toRows([lot], []);
    expect(row?.identifiedAs).toBeNull();
    expect(row?.confidence).toBeNull();
  });

  it('keeps a lot with no bid as no bid, not as nought', () => {
    const [row] = toRows([{ ...lot, current_bid: null }], []);
    expect(row?.currentBid).toBeNull();
  });

  it('matches each identification to its own lot', () => {
    const second = { ...lot, id: 'lot-2', lot_number: '0002-23502418' };
    const rows = toRows([lot, second], [{ ...identification, lot_id: 'lot-2' }]);
    expect(rows[0]?.identifiedAs).toBeNull();
    expect(rows[1]?.identifiedAs).toBe('2015 Invented Wagon Alpha');
  });
});

describe('saying what a lot is', () => {
  it('reads as a year, a make and a model', () => {
    expect(describeIdentification(identification)).toBe('2015 Invented Wagon Alpha');
  });

  it('says what it can when part is missing', () => {
    expect(describeIdentification({ ...identification, year: null })).toBe('Invented Wagon Alpha');
  });

  it('says nothing rather than an empty string', () => {
    // A blank cell reads as a failure. Nothing at all reads as work not done.
    expect(
      describeIdentification({ ...identification, brand: null, model: null, year: null }),
    ).toBeNull();
  });
});

describe('the note above the table', () => {
  it('says the list is filling in while triage runs', () => {
    expect(pendingNoteFor(0, 36)).toMatch(/still working out what each lot is/);
  });

  it('says how far it has got part way through', () => {
    expect(pendingNoteFor(12, 36)).toMatch(/12 of 36/);
  });

  it('says what is still to come once every lot is identified', () => {
    // SC05 wants a resale range and a maximum bid, and neither exists yet.
    expect(pendingNoteFor(36, 36)).toMatch(/resale range and the most you should bid/);
  });

  it('says nothing when there are no lots, because the table says that itself', () => {
    expect(pendingNoteFor(0, 0)).toBeUndefined();
  });
});

describe('the order of the list', () => {
  const two = [
    { ...lot, id: 'a', lot_number: '0001' },
    { ...lot, id: 'b', lot_number: '0002' },
  ];

  it('puts the best lot first', () => {
    // Decision record 0023. The score is why the list is in this order.
    const rows = toRows(
      two,
      [],
      [
        {
          lot_id: 'a',
          triage_low: null,
          triage_high: null,
          triage_max_bid: null,
          opportunity_score: 40,
        },
        {
          lot_id: 'b',
          triage_low: null,
          triage_high: null,
          triage_max_bid: null,
          opportunity_score: 100,
        },
      ],
    );
    expect(rows.map((r) => r.id)).toEqual(['b', 'a']);
  });

  it('puts an unscored lot below every scored one', () => {
    // Not that it scored badly, but that we could not say.
    const rows = toRows(
      two,
      [],
      [
        {
          lot_id: 'a',
          triage_low: null,
          triage_high: null,
          triage_max_bid: null,
          opportunity_score: null,
        },
        {
          lot_id: 'b',
          triage_low: null,
          triage_high: null,
          triage_max_bid: null,
          opportunity_score: 0,
        },
      ],
    );
    expect(rows.map((r) => r.id)).toEqual(['b', 'a']);
  });

  it('falls back to the lot number, so the same list reads the same way twice', () => {
    const rows = toRows(two, [], []);
    expect(rows.map((r) => r.lotNumber)).toEqual(['0001', '0002']);
  });

  it('carries the maximum bid through', () => {
    const rows = toRows(
      [two[0]!],
      [],
      [
        {
          lot_id: 'a',
          triage_low: null,
          triage_high: null,
          triage_max_bid: '8499.50',
          opportunity_score: 100,
        },
      ],
    );
    expect(rows[0]?.maxBid).toBe(8499.5);
  });
});

describe('which resale range the screen shows', () => {
  const sharedRange = { lot_id: 'lot-1', conservative: '8500.00', optimistic: '22500.00' };
  const override = {
    lot_id: 'lot-1',
    triage_low: '9000.00',
    triage_high: '14000.00',
    triage_max_bid: '4200.00',
    opportunity_score: 80,
  };
  const noOverride = { ...override, triage_low: null, triage_high: null };

  it('shows the shared range when the organisation has not corrected it', () => {
    // The ordinary case. A resale value does not depend on who is buying, so
    // everybody reads the same one. Decision record 0024.
    const [row] = toRows([lot], [], [noOverride], [sharedRange]);
    expect(row).toMatchObject({ resaleLow: 8500, resaleHigh: 22500 });
  });

  it('prefers the organisation own correction where they made one', () => {
    const [row] = toRows([lot], [], [override], [sharedRange]);
    expect(row).toMatchObject({ resaleLow: 9000, resaleHigh: 14000 });
  });

  it('shows no range when neither source has one', () => {
    const [row] = toRows([lot], [], [noOverride], []);
    expect(row).toMatchObject({ resaleLow: null, resaleHigh: null });
  });

  it('falls back to the shared range rather than showing half a correction', () => {
    // Mixing a corrected low with a shared high would produce a span nobody
    // worked out and nobody could explain.
    const halfCorrected = { ...override, triage_high: null };
    const [row] = toRows([lot], [], [halfCorrected], [sharedRange]);
    expect(row).toMatchObject({ resaleLow: 8500, resaleHigh: 22500 });
  });

  it('shows no range when the shared one is half missing too', () => {
    const halfShared = { lot_id: 'lot-1', conservative: '8500.00', optimistic: null };
    const [row] = toRows([lot], [], [noOverride], [halfShared]);
    expect(row).toMatchObject({ resaleLow: null, resaleHigh: null });
  });

  it('keeps the maximum bid out of the shared range, because it is theirs', () => {
    // The range is shared. The bid figure comes from their own profit target
    // and GST position, so it stays on their analysis.
    const [row] = toRows([lot], [], [noOverride], [sharedRange]);
    expect(row.maxBid).toBe(4200);
  });
});

describe('saying when we last checked the bids', () => {
  const now = new Date('2026-10-22T12:00:00.000Z');
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

  it('says nothing when we have never checked', () => {
    // A sentence about a check that never happened is worse than no sentence.
    expect(bidsCheckedNoteFor([], now)).toBeUndefined();
    expect(bidsCheckedNoteFor([null, null], now)).toBeUndefined();
  });

  it('says just now for a check inside the minute', () => {
    expect(bidsCheckedNoteFor([ago(0)], now)).toBe('We checked the current bids just now.');
  });

  it('counts in minutes under the hour', () => {
    expect(bidsCheckedNoteFor([ago(14)], now)).toContain('14 minutes ago');
  });

  it('uses the singular for one', () => {
    expect(bidsCheckedNoteFor([ago(1)], now)).toContain('1 minute ago');
    expect(bidsCheckedNoteFor([ago(60)], now)).toContain('1 hour ago');
  });

  it('counts in hours under the day', () => {
    expect(bidsCheckedNoteFor([ago(60 * 7)], now)).toContain('7 hours ago');
  });

  it('counts in days beyond that, and says the figures may be well out of date', () => {
    const note = bidsCheckedNoteFor([ago(60 * 24 * 3)], now)!;
    expect(note).toContain('3 days ago');
    expect(note).toContain('well out of date');
  });

  it('quotes the oldest check, not the newest', () => {
    // A list is only as current as its stalest row. Quoting the newest would
    // describe the best case as the whole picture.
    expect(bidsCheckedNoteFor([ago(2), ago(400)], now)).toContain('7 hours ago');
  });

  it('ignores a lot we have never checked rather than treating it as ancient', () => {
    expect(bidsCheckedNoteFor([null, ago(14)], now)).toContain('14 minutes ago');
  });

  it('tells the reader to check the site before bidding', () => {
    // We are stating a fact about a figure we read, not telling anybody what
    // to bid. The auction site is the only live answer.
    expect(bidsCheckedNoteFor([ago(30)], now)).toContain('auction site');
  });

  it('contains no dashes, as the writing rules require', () => {
    for (const minutes of [0, 5, 90, 60 * 24 * 2]) {
      expect(bidsCheckedNoteFor([ago(minutes)], now)).not.toMatch(/[-–—]/);
    }
  });
});

describe('a sale that has already closed', () => {
  const now = new Date('2026-10-22T12:00:00.000Z');
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

  it('says the bids are the last we read rather than dating them', () => {
    // A closed sale's bids cannot move. Warning they may be out of date would
    // mislead the other way: these are what the lots finished on.
    const note = bidsCheckedNoteFor([ago(60 * 24 * 4)], now, true)!;
    expect(note).toContain('This sale has closed');
    expect(note).not.toContain('out of date');
  });

  it('still says nothing when we never read a bid', () => {
    expect(bidsCheckedNoteFor([null], now, true)).toBeUndefined();
  });

  it('dates the bids while the sale is still running', () => {
    expect(bidsCheckedNoteFor([ago(30)], now, false)).toContain('30 minutes ago');
  });
});

describe('the freshness sentence the screen actually uses', () => {
  const now = new Date('2026-10-22T12:00:00.000Z');
  const at = (hours: number) => new Date(now.getTime() + hours * 3_600_000).toISOString();
  const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

  it('treats the sale as closed only when every lot has closed', () => {
    // One lot still running means the sale is still running, and the bids on
    // every lot in it can still move.
    const mixed = [
      { closes_at: at(-1), bid_checked_at: ago(20) },
      { closes_at: at(3), bid_checked_at: ago(20) },
    ];
    expect(bidFreshnessNote(mixed, now)).toContain('20 minutes ago');

    const allClosed = [
      { closes_at: at(-1), bid_checked_at: ago(20) },
      { closes_at: at(-2), bid_checked_at: ago(20) },
    ];
    expect(bidFreshnessNote(allClosed, now)).toContain('This sale has closed');
  });

  it('treats an unknown closing time as still running', () => {
    // We cannot say a sale has ended on the strength of not knowing when it
    // ends, and claiming these were the final bids would be a guess.
    const unknown = [{ closes_at: null, bid_checked_at: ago(20) }];
    expect(bidFreshnessNote(unknown, now)).toContain('20 minutes ago');
  });

  it('says nothing for a catalogue with no lots', () => {
    expect(bidFreshnessNote([], now)).toBeUndefined();
  });
});
