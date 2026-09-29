import { describe, expect, it } from 'vitest';
import { describeIdentification, pendingNoteFor, toRows } from './lots';

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
