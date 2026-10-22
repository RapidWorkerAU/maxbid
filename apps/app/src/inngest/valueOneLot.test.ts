// Reading a lot well enough to value it.
//
// Both of these were written when the odometer was being dropped silently: a
// Landcruiser on 549,752 km was valued at $36,000 to $50,000 and graded as an
// exact match. Neither had a test until now.

import { describe, expect, it } from 'vitest';
import { describeLot, kilometresOf, type LotToValue } from './valueOneLot';

function lot(over: Partial<LotToValue> = {}): LotToValue {
  return {
    lot_id: 'lot-1',
    brand: 'Invented',
    model: 'Cruiser Gamma',
    year: 2008,
    specs: {},
    lots: null,
    ...over,
  };
}

describe('reading the odometer the catalogue stated', () => {
  it('reads a reading with units and separators', () => {
    expect(kilometresOf({ attributes: { odometer: '549,752 km' } })).toBe(549752);
  });

  it('reads a bare number', () => {
    expect(kilometresOf({ attributes: { odometer: '120000' } })).toBe(120000);
  });

  it('returns null when the catalogue did not say', () => {
    // Null means usage is not something this lot has, which is a different
    // thing from a reading of zero and is graded differently.
    expect(kilometresOf({ attributes: {} })).toBeNull();
    expect(kilometresOf({})).toBeNull();
    expect(kilometresOf(null)).toBeNull();
    expect(kilometresOf('549,752 km')).toBeNull();
  });

  it('returns null for a reading of nothing', () => {
    expect(kilometresOf({ attributes: { odometer: '0 km' } })).toBeNull();
    expect(kilometresOf({ attributes: { odometer: 'unknown' } })).toBeNull();
  });

  it('returns null when the reading is not text', () => {
    expect(kilometresOf({ attributes: { odometer: 120000 } })).toBeNull();
  });
});

describe('describing a lot for the model to compare against', () => {
  it('puts the odometer in the description, so a comparable can be graded on it', () => {
    expect(describeLot(lot(), 549752)).toBe('2008 Invented Cruiser Gamma odometer 549,752 km');
  });

  it('includes the fuel when the catalogue stated one', () => {
    expect(describeLot(lot({ specs: { fuel: 'Diesel' } }), null)).toBe(
      '2008 Invented Cruiser Gamma Diesel',
    );
  });

  it('leaves out what we do not know rather than saying it', () => {
    expect(describeLot(lot({ year: null, brand: null }), null)).toBe('Cruiser Gamma');
  });

  it('says nothing at all when the lot was never identified', () => {
    // An empty description is right here. A made up one would send the search
    // after the wrong thing and the evidence would look real.
    expect(describeLot(lot({ year: null, brand: null, model: null }), null)).toBe('');
  });
});
