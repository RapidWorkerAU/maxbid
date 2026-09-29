import { describe, expect, it } from 'vitest';
import { parseGraysPremium, parseGraysSaleTitle } from './graysPremium';
import {
  DESCRIPTION_PREMIUM,
  GST_NOTE,
  LOT_PAGE,
  PART_OF_SALE_ROW,
  PREMIUM_TABLE,
} from './graysPremiumFixture';

describe('reading the premium from a lot page', () => {
  const parsed = parseGraysPremium(LOT_PAGE);

  it('reads every band', () => {
    expect(parsed?.schedule.bands).toEqual([
      { upTo: 2000, kind: 'fixed', amount: 495 },
      { upTo: 5000, kind: 'fixed', amount: 650 },
      { upTo: 10000, kind: 'fixed', amount: 710 },
      { upTo: 30000, kind: 'rate', rate: 0.07 },
      { upTo: 40000, kind: 'rate', rate: 0.06 },
      { upTo: null, kind: 'rate', rate: 0.05 },
    ]);
  });

  it('turns a percentage into a fraction', () => {
    expect(parsed?.schedule.bands[3]).toMatchObject({ kind: 'rate', rate: 0.07 });
  });

  it('reads the row written with a plus sign as the last band', () => {
    expect(parsed?.schedule.bands.at(-1)?.upTo).toBeNull();
  });

  it('notices that GST is already inside those figures', () => {
    expect(parsed?.schedule.includesGst).toBe(true);
  });

  it('keeps the rows as the page wrote them', () => {
    expect(parsed?.sourceText.split('\n')).toHaveLength(6);
    expect(parsed?.sourceText).toContain('| $0 - $2,000 | $495 |');
  });

  it('ignores the different premium in the description', () => {
    // D131. The Overview table governs, and the description is kept as raw
    // terms elsewhere so the user can be shown both.
    expect(parsed?.sourceText).not.toContain('Standard Car');
    expect(parsed?.schedule.bands[0]).toMatchObject({ amount: 495 });
  });

  it('is not confused by the table appearing twice on the page', () => {
    expect(parsed?.schedule.bands).toHaveLength(6);
  });
});

describe('when GST is not said to be included', () => {
  it('leaves the schedule as a figure before tax', () => {
    const withoutNote = LOT_PAGE.replace(GST_NOTE, '');
    expect(parseGraysPremium(withoutNote)?.schedule.includesGst).toBe(false);
  });
});

describe('refusing a table we cannot read', () => {
  it('reads nothing from a page with no table', () => {
    expect(parseGraysPremium(`### Description\n\n${DESCRIPTION_PREMIUM}`)).toBeNull();
  });

  it('refuses a table with a gap in its ranges', () => {
    // A lot priced inside the gap would carry a premium belonging to some
    // other price, which is worse than having no premium at all.
    const gapped = PREMIUM_TABLE.replace('| $2,001 - $5,000 | $650 |\n', '');
    expect(parseGraysPremium(gapped)).toBeNull();
  });

  it('refuses a table that does not start at zero', () => {
    const late = PREMIUM_TABLE.replace('| $0 - $2,000 | $495 |\n', '');
    expect(parseGraysPremium(late)).toBeNull();
  });

  it('refuses a table that never ends', () => {
    const unfinished = PREMIUM_TABLE.replace('| $40,001+ | 5% |', '');
    expect(parseGraysPremium(unfinished)).toBeNull();
  });

  it('refuses a page whose two copies of the table disagree', () => {
    // If they disagree we cannot tell which the auction means, so we read
    // neither and let DS12 explain the fallback.
    const disagreeing = LOT_PAGE.replace(
      /\| \$0 - \$2,000 \| \$495 \|([\s\S]*)\| \$0 - \$2,000 \| \$495 \|/,
      '| $0 - $2,000 | $495 |$1| $0 - $2,000 | $600 |',
    );
    expect(parseGraysPremium(disagreeing)).toBeNull();
  });
});

describe('reading the sale name from a lot page', () => {
  it('takes the name from the labelled row', () => {
    expect(parseGraysSaleTitle(PART_OF_SALE_ROW)).toBe('Invented Perth Motor Vehicle Auction');
  });

  it('reads nothing when the row is not there', () => {
    expect(parseGraysSaleTitle(LOT_PAGE)).toBeNull();
  });
});
