import { describe, expect, it } from 'vitest';
import { LOT_PAGE } from '../extract/graysPremiumFixture';
import { closesAtFrom, termsFrom } from './normalise';

const platformDefault = { bands: [{ upTo: null, kind: 'rate' as const, rate: 0.165 }] };

describe('when the auction states its own terms', () => {
  const terms = termsFrom(LOT_PAGE, platformDefault);

  it('uses the auction, not the platform default', () => {
    expect(terms.source).toBe('extracted');
    expect(terms.schedule?.bands).toHaveLength(6);
  });

  it('keeps the rows it read them from', () => {
    expect(terms.rawTerms).toContain('| $0 - $2,000 | $495 |');
  });
});

describe('when the page states nothing readable', () => {
  const terms = termsFrom('### Description\n\nNothing about a premium here.', platformDefault);

  it('falls back to what the platform charges', () => {
    expect(terms.schedule).toEqual(platformDefault);
  });

  it('records that it was a fallback, so DS12 can say so', () => {
    // F10 says the premium is shown with its source. A user has to be able to
    // tell a figure read from this auction from one we assumed.
    expect(terms.source).toBe('platform_default');
  });

  it('keeps no raw terms, because none were read', () => {
    expect(terms.rawTerms).toBeNull();
  });
});

describe('when there is no platform default either', () => {
  it('stores no premium at all rather than inventing one', () => {
    const terms = termsFrom('Nothing here.', null);
    expect(terms.schedule).toBeNull();
    expect(terms.source).toBe('platform_default');
  });
});

describe('when a sale finishes', () => {
  // The auction row had no closing time at all until this. Extraction writes
  // one per lot and nothing rolled them up, so the harvester, which looks for
  // sales by that field, would never have found a single closed sale.
  it('is when its last lot closes', () => {
    expect(
      closesAtFrom([
        { closesAt: '2026-09-29T11:00:00.000Z' },
        { closesAt: '2026-09-29T11:30:00.000Z' },
        { closesAt: '2026-09-29T11:15:00.000Z' },
      ]),
    ).toBe('2026-09-29T11:30:00.000Z');
  });

  it('copes with a sale whose lots all close together', () => {
    // The Grays vehicle sale closed all 36 at once.
    expect(closesAtFrom([{ closesAt: '2026-09-29T11:30:00.000Z' }])).toBe(
      '2026-09-29T11:30:00.000Z',
    );
  });

  it('ignores a lot with no closing time', () => {
    expect(closesAtFrom([{}, { closesAt: '2026-09-29T11:30:00.000Z' }])).toBe(
      '2026-09-29T11:30:00.000Z',
    );
  });

  it('says nothing when no lot has one', () => {
    // Better than a made up time, which would have the harvester read the
    // pages while bidding was still running.
    expect(closesAtFrom([{}, {}])).toBeNull();
    expect(closesAtFrom([])).toBeNull();
  });

  it('ignores a closing time it cannot read', () => {
    expect(closesAtFrom([{ closesAt: 'next Tuesday' }])).toBeNull();
  });
});
