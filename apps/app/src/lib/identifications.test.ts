// Which identification of a lot is read. Decision record 0024.

import { describe, expect, it } from 'vitest';
import { namesSomething, preferCorrection } from './identifications';

const baseline = { lot_id: 'lot-1', analysis_id: null, brand: 'Invented' };
const correction = { lot_id: 'lot-1', analysis_id: 'analysis-1', brand: 'Something else' };

describe('choosing between a baseline and a correction', () => {
  it('reads the baseline when nobody has corrected it', () => {
    expect(preferCorrection([baseline])).toEqual([baseline]);
  });

  it('prefers the correction over the baseline', () => {
    expect(preferCorrection([baseline, correction])).toEqual([correction]);
  });

  it('prefers it whichever order the rows arrived in', () => {
    // Nothing orders these rows, so a rule that overwrote as it went would
    // show the baseline or the correction depending on the query plan.
    expect(preferCorrection([correction, baseline])).toEqual([correction]);
  });

  it('returns one row per lot and no more', () => {
    expect(preferCorrection([baseline, correction])).toHaveLength(1);
  });

  it('keeps every lot, not only the corrected ones', () => {
    const other = { lot_id: 'lot-2', analysis_id: null, brand: 'Another' };
    const kept = preferCorrection([baseline, correction, other]).map((row) => row.lot_id);
    expect(kept.sort()).toEqual(['lot-1', 'lot-2']);
  });

  it('handles nothing at all', () => {
    expect(preferCorrection([])).toEqual([]);
  });

  it('does not mix two organisations corrections together', () => {
    // The query only ever asks for one organisation's corrections, so two
    // arriving would mean the filter was lost. Taking the first is wrong
    // either way, so this records what it does rather than claiming it is
    // right: one row out, so nothing is silently shown twice.
    const theirs = { lot_id: 'lot-1', analysis_id: 'analysis-2', brand: 'Theirs' };
    expect(preferCorrection([correction, theirs])).toHaveLength(1);
  });
});

describe('whether a stored row says what the lot is', () => {
  it('counts a brand on its own', () => {
    expect(namesSomething({ brand: 'Invented', model: null })).toBe(true);
  });

  it('counts a model on its own', () => {
    expect(namesSomething({ brand: null, model: 'Cruiser Gamma' })).toBe(true);
  });

  it('does not count a row that named neither', () => {
    // The baseline is read by everybody, so a failed reading treated as an
    // answer would be carried forward to every organisation that looks at the
    // lot, and nothing would ever try again.
    expect(namesSomething({ brand: null, model: null })).toBe(false);
  });

  it('does not count an empty string as a name', () => {
    expect(namesSomething({ brand: '', model: '' })).toBe(false);
  });
});
