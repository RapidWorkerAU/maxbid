// Working a range out again from evidence we already hold. F62.

import type { Comparable } from '@maxbid/calc';
import { describe, expect, it } from 'vitest';
import { rangeBeforeAndAfter } from './recompute';

function comparable(id: string, price: number): Comparable {
  return { id, price, matchLevel: 'exact', evidenceType: 'marketplaceSold', ageInDays: 20 };
}

const four = [
  comparable('a', 14000),
  comparable('b', 15000),
  comparable('c', 16000),
  comparable('d', 40000),
];

describe('the range with and without the ones somebody set aside', () => {
  it('works both out, because F62 shows the figures before and after', () => {
    const { before, after } = rangeBeforeAndAfter(four, new Set(['d']));
    expect(before.combinedWeight).toBeGreaterThan(after.combinedWeight);
  });

  it('leaves the one they set aside out of the figures', () => {
    // Setting the cheapest sale aside moves the middle of the range up,
    // because the figure is a weighted median of what is left. Which way it
    // moves is the reader's business: what matters is that their judgement
    // reaches the figure at all.
    const { before, after } = rangeBeforeAndAfter(four, new Set(['a']));
    expect(after.scenarios.expected!).toBeGreaterThan(before.scenarios.expected!);
  });

  it('is not thrown off by one wild price, set aside or not', () => {
    // The 40,000 is the outlier a reader would reach for first, and taking it
    // out barely moves the figure. That is the median doing its job, and it
    // is worth knowing before anybody reports the exclusion as broken.
    const { before, after } = rangeBeforeAndAfter(four, new Set(['d']));
    expect(after.scenarios.expected).toBe(before.scenarios.expected);
    expect(after.combinedWeight).toBeLessThan(before.combinedWeight);
  });

  it('keeps it in the working, so the panel can still show it', () => {
    const { after } = rangeBeforeAndAfter(four, new Set(['d']));
    expect(after.weighted).toHaveLength(4);
    expect(after.counted.map((c) => c.id)).not.toContain('d');
  });

  it('changes nothing where nothing is set aside', () => {
    const { before, after } = rangeBeforeAndAfter(four, new Set());
    expect(after.scenarios).toEqual(before.scenarios);
  });

  it('ignores an exclusion naming a comparable that is not there', () => {
    const { before, after } = rangeBeforeAndAfter(four, new Set(['gone']));
    expect(after.scenarios).toEqual(before.scenarios);
  });

  it('falls below the evidence rule once too many are set aside', () => {
    // Their own judgement can leave us without enough to stand behind, and
    // then the honest answer is no figure rather than a figure built on one
    // sale. The screen says so.
    const { after } = rangeBeforeAndAfter(four, new Set(['a', 'b', 'c']));
    expect(after.hasEnoughEvidence).toBe(false);
  });
});
