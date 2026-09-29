import { describe, expect, it } from 'vitest';
import { MATERIAL_USAGE_GAP, readUsage, usageGap } from './usage';

describe('finding the odometer on a listing page', () => {
  it.each([
    ['145,200 km', 145200],
    ['145200km', 145200],
    ['145,200 kms', 145200],
    ['145,200 kilometres', 145200],
    ['Odometer 145,200', 145200],
    ['Odometer: 145,200 km', 145200],
    ['Odometer reading 145,200 km', 145200],
  ])('reads %s', (text, expected) => {
    expect(readUsage(`A listing. ${text}. For sale.`)?.kilometres).toBe(expected);
  });

  it('keeps the words it read it from, so a person can check', () => {
    expect(readUsage('Odometer 145,200 km')?.source).toContain('145,200');
  });

  it('takes the reading the page repeats', () => {
    // A listing states the real figure in its summary, its specification
    // table and often its description. A stray number appears once.
    const page = 'Summary 145,200 km. Specs: 145,200 km. Also 8,900 km of warranty left.';
    expect(readUsage(page)?.kilometres).toBe(145200);
  });

  it('believes the larger of two equally repeated readings', () => {
    // Understating usage overstates what a lot is worth, so the cautious
    // reading is the safer one.
    expect(readUsage('200,000 km and 100,000 km')?.kilometres).toBe(200000);
  });
});

describe('refusing a number that is not a reading', () => {
  it('ignores a bare number with no unit', () => {
    // On a listing page a bare number is as likely to be a price, a postcode
    // or a stock number.
    expect(readUsage('Priced at 18,500. Stock 44921.')).toBeNull();
  });

  it('ignores a price even where it sits beside a unit elsewhere', () => {
    expect(readUsage('$18,500 drive away. Call now.')).toBeNull();
  });

  it('ignores a reading too small to be real', () => {
    expect(readUsage('12 km')).toBeNull();
  });

  it('ignores a reading too large to believe', () => {
    expect(readUsage('9,000,000 km')).toBeNull();
  });

  it('reads nothing from a page that says nothing', () => {
    expect(readUsage('A very nice car. Call for details.')).toBeNull();
  });
});

describe('how far apart two readings are', () => {
  it('is nothing when they agree', () => {
    expect(usageGap(150000, 150000)).toBe(0);
  });

  it('measures against the larger reading', () => {
    expect(usageGap(100000, 200000)).toBeCloseTo(0.5, 10);
  });

  it('is the same whichever way round they are given', () => {
    expect(usageGap(550000, 150000)).toBeCloseTo(usageGap(150000, 550000), 10);
  });

  it('calls the Landcruiser a different item', () => {
    // 549,752 against an ordinary 150,000 is the case this exists for.
    expect(usageGap(549752, 150000)).toBeGreaterThan(MATERIAL_USAGE_GAP);
  });

  it('calls two ordinary readings the same sort of item', () => {
    expect(usageGap(150000, 200000)).toBeLessThan(MATERIAL_USAGE_GAP);
  });

  it('copes with a reading of nothing', () => {
    expect(usageGap(0, 0)).toBe(0);
  });
});
