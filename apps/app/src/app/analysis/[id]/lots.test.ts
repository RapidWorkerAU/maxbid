import { describe, expect, it } from 'vitest';
import { describeIdentification, pendingNoteFor, pendingFor, toRows } from './lots';

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
  });

  it('carries confidence in the figures, not in what the lot is', () => {
    // The identification's own confidence does not belong in a column that
    // sits among the money. It read as confidence in the figures, and said
    // "High confidence" beside "Not enough evidence" on eleven rows of a
    // real catalogue.
    const shared = { lot_id: 'lot-1', conservative: '8500.00', optimistic: '22500.00' };
    const noOverride = {
      lot_id: 'lot-1',
      triage_low: null,
      triage_high: null,
      triage_max_bid: null,
      opportunity_score: null,
    };

    const withRange = toRows(
      [lot],
      [identification],
      [noOverride],
      [{ ...shared, confidence: '62.00' }],
    );
    expect(withRange[0]?.confidence).toBe(62);

    const withoutRange = toRows([lot], [identification]);
    expect(withoutRange[0]?.confidence).toBeNull();
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
describe('telling a wait apart from an answer', () => {
  const running = { analysisSettled: false, attempted: false };

  it('says the identification is still running when we have no name for the lot', () => {
    expect(pendingFor({ identifiedAs: null, resaleLow: null }, running)).toBe('identification');
  });

  it('says the valuation is still running once the lot has a name', () => {
    expect(pendingFor({ identifiedAs: 'A wagon', resaleLow: null }, running)).toBe('valuation');
  });

  it('says nothing is pending once the lot has a range', () => {
    expect(pendingFor({ identifiedAs: 'A wagon', resaleLow: 14000 }, running)).toBeNull();
  });

  it('says nothing is pending once we have tried and could not', () => {
    // An attempt is the evidence that we looked. With one, a blank figure is
    // an answer rather than a wait.
    expect(
      pendingFor({ identifiedAs: 'A wagon', resaleLow: null }, { ...running, attempted: true }),
    ).toBeNull();
  });

  it('says nothing is pending once the analysis has settled', () => {
    // A lot still blank then is a lot we could not do, whether or not an
    // attempt was recorded. Saying it is being worked on would be a wait that
    // never ends.
    expect(
      pendingFor(
        { identifiedAs: null, resaleLow: null },
        { analysisSettled: true, attempted: false },
      ),
    ).toBeNull();
  });

  it('treats an empty name as no name, not as a name', () => {
    expect(pendingFor({ identifiedAs: '', resaleLow: null }, running)).toBe('identification');
  });
});
