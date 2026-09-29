import { describe, expect, it } from 'vitest';
import { LOT_PAGE } from '../extract/graysPremiumFixture';
import { termsFrom } from './normalise';

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
