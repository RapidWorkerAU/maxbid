import { describe, expect, it } from 'vitest';
import { EXTRACTOR_VERSION, lotRows } from './extract';
import { parseGraysCatalogue } from '../extract/grays';
import { COMPLETE_PAGE, LOTS } from '../extract/graysFixture';

const AUCTION = '11111111-2222-3333-4444-555555555555';

// When the page these lots came from was fetched, which is the only honest
// answer to when the bid was current.
const CHECKED_AT = '2026-09-25T09:00:00.000Z';

describe('mapping parsed lots to rows', () => {
  const parsed = parseGraysCatalogue(COMPLETE_PAGE);
  const rows = lotRows(AUCTION, parsed.lots, CHECKED_AT);

  it('writes one row per lot', () => {
    expect(rows).toHaveLength(LOTS.length);
  });

  it('ties every row to its auction', () => {
    expect(rows.every((row) => row.auction_id === AUCTION)).toBe(true);
  });

  it('carries the lot number the unique constraint depends on', () => {
    expect(rows[0]!.lot_number).toBe('0001-23502297');
    expect(new Set(rows.map((r) => r.lot_number)).size).toBe(rows.length);
  });

  it('carries the bid and the closing time', () => {
    expect(rows[0]!.current_bid).toBe(150);
    expect(rows[0]!.closes_at).toBe('2026-09-25T11:00:00.000Z');
  });

  it('writes null rather than undefined when a figure is missing', () => {
    // Postgres takes null. undefined would silently drop the column.
    const [row] = lotRows(
      AUCTION,
      [{ lotNumber: '0001-1', title: 'A lot', lotUrl: 'https://example.test/lot/1' }],
      CHECKED_AT,
    );
    expect(row!.current_bid).toBeNull();
    expect(row!.closes_at).toBeNull();
  });

  it('keeps the slice of the payload that produced the lot', () => {
    // lots.raw holds this lot. The whole page lives in raw_extract.
    expect(rows[0]!.raw).toMatchObject({ lotNumber: '0001-23502297', currentBid: 150 });
  });
});

describe('the extractor version', () => {
  it('names the method, so an old payload can be reprocessed under a new one', () => {
    // R01 mitigates a site redesign with versioned extractors, which only
    // works if every stored payload says which version read it.
    expect(EXTRACTOR_VERSION).toMatch(/^grays-markdown-\d+\.\d+\.\d+$/);
  });
});

describe('saying when the bid was checked', () => {
  const parsed = parseGraysCatalogue(COMPLETE_PAGE);

  it('records when the page was fetched, not when the parse ran', () => {
    // A parse can run minutes after the fetch, and a replay from raw_extract
    // can run days after it. Using now would claim a bid is fresher than it is.
    const rows = lotRows(AUCTION, parsed.lots, CHECKED_AT);
    expect(rows.every((row) => row.bid_checked_at === CHECKED_AT)).toBe(true);
  });

  it('records the check even where the lot had no bid', () => {
    // A lot nobody has bid on is a bid we read and found to be nothing. The
    // reading still happened, so the time is not null.
    const [row] = lotRows(
      AUCTION,
      [{ lotNumber: '0001-1', title: 'A lot', lotUrl: 'https://example.test/lot/1' }],
      CHECKED_AT,
    );
    expect(row!.current_bid).toBeNull();
    expect(row!.bid_checked_at).toBe(CHECKED_AT);
  });
});
