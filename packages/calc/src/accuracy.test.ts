import { describe, expect, it } from 'vitest';
import { accuracyOf, median, summariseAccuracy } from './accuracy';

/** Figures from the Grays Perth sale, where every lot sold. */
const landcruiser = { id: 'cruiser', low: 8500, high: 22500, soldFor: 12800 };
const qashqai = { id: 'qashqai', low: 10799, high: 15465, soldFor: 3809 };
const cx5 = { id: 'cx5', low: 4500, high: 7100, soldFor: 6266 };

describe('where one estimate landed', () => {
  it('knows when the hammer price was inside the range', () => {
    // $12,800 against $8,500 to $22,500.
    expect(accuracyOf(landcruiser).insideTheRange).toBe(true);
  });

  it('knows when it was not', () => {
    // The QASHQAI fetched $3,809 against an estimate starting at $10,799.
    expect(accuracyOf(qashqai).insideTheRange).toBe(false);
  });

  it('measures the conservative estimate against what it fetched', () => {
    expect(accuracyOf(qashqai).ratio).toBeCloseTo(2.84, 2);
    expect(accuracyOf(cx5).ratio).toBeCloseTo(0.72, 2);
  });

  it('counts a lot at the very edge of the range as inside it', () => {
    expect(accuracyOf({ id: 'edge', low: 100, high: 200, soldFor: 200 }).insideTheRange).toBe(true);
    expect(accuracyOf({ id: 'edge', low: 100, high: 200, soldFor: 100 }).insideTheRange).toBe(true);
  });
});

describe('the middle of a handful of numbers', () => {
  it('is the middle one when there is an odd count', () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it('is the average of the two middle ones when there is an even count', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('is nothing when there is nothing', () => {
    // Not zero, which would read as a measurement.
    expect(median([])).toBeNull();
  });
});

describe('summarising a catalogue', () => {
  const summary = summariseAccuracy([landcruiser, qashqai, cx5]);

  it('counts how many landed inside the range', () => {
    expect(summary.insideTheRange).toBe(2);
  });

  it('reports the middle ratio rather than an average', () => {
    // The three ratios are 0.66, 0.72 and 2.84, so the middle is 0.72 and the
    // mean would be 1.41. One estimate at nearly three times drags a mean
    // well past what the sample actually looks like, which is why the median
    // is the figure reported.
    expect(summary.medianRatio).toBeCloseTo(0.72, 2);
  });

  it('reports the furthest in each direction', () => {
    expect(summary.highestRatio).toBeCloseTo(2.84, 2);
    expect(summary.lowestRatio).toBeCloseTo(0.66, 2);
  });

  it('leaves out a lot that did not sell', () => {
    // Counting it would move the figures depending on which way it was left
    // out, and it is not a measurement of anything.
    const withUnsold = summariseAccuracy([landcruiser, { id: 'unsold', low: 10, high: 20, soldFor: 0 }]);
    expect(withUnsold.lots).toHaveLength(1);
  });

  it('reports nothing rather than zero when nothing can be measured', () => {
    const empty = summariseAccuracy([]);
    expect(empty.medianRatio).toBeNull();
    expect(empty.insideTheRange).toBe(0);
  });
});
