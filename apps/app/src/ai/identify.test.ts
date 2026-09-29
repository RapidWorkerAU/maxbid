import { describe, expect, it } from 'vitest';
import {
  SYSTEM_PROMPT,
  IdentificationError,
  PHOTO_PASS_BELOW,
  needsPhotoPass,
  readIdentification,
  userPromptFor,
} from './identify';

const good = JSON.stringify({
  brand: 'Mitsubishi',
  model: 'Outlander Exceed',
  year: 2015,
  specs: { fuel: 'Diesel', odometer: '144,026' },
  conditionNotes: 'Listed on the written off vehicle register',
  confidence: 88,
});

describe('reading the answer', () => {
  it('reads a clean reply', () => {
    expect(readIdentification(good)).toEqual({
      brand: 'Mitsubishi',
      model: 'Outlander Exceed',
      year: 2015,
      specs: { fuel: 'Diesel', odometer: '144,026' },
      conditionNotes: 'Listed on the written off vehicle register',
      confidence: 88,
    });
  });

  it('strips a code fence, which models add however firmly they are asked not to', () => {
    expect(readIdentification('```json\n' + good + '\n```').brand).toBe('Mitsubishi');
  });

  it('keeps a null rather than turning it into a guess', () => {
    const vague = JSON.stringify({ brand: null, model: null, year: null, confidence: 20 });
    const read = readIdentification(vague);
    expect(read.brand).toBeNull();
    expect(read.year).toBeNull();
  });

  it('treats an empty string as nothing said', () => {
    const blank = JSON.stringify({ brand: '   ', model: 'X', confidence: 50 });
    expect(readIdentification(blank).brand).toBeNull();
  });

  it('defaults specs to an empty object rather than failing on them', () => {
    expect(readIdentification(JSON.stringify({ confidence: 50 })).specs).toEqual({});
  });
});

describe('refusing an answer it cannot read', () => {
  // A half read identification is worse than none. It looks like an answer,
  // and everything after it treats it as one.
  it('refuses a reply that is not JSON', () => {
    expect(() => readIdentification('I think it is a car.')).toThrow(IdentificationError);
  });

  it('refuses JSON that is not an object', () => {
    expect(() => readIdentification('[1, 2, 3]')).toThrow(/not an object/);
  });

  it('refuses a missing confidence', () => {
    // Without it we cannot tell whether to pay to look at the photo.
    expect(() => readIdentification(JSON.stringify({ brand: 'X' }))).toThrow(/confidence/);
  });

  it.each([-1, 101])('refuses a confidence of %s', (confidence) => {
    expect(() => readIdentification(JSON.stringify({ confidence }))).toThrow(/confidence/);
  });

  it.each([
    ['null', '{"confidence": null}'],
    ['a string', '{"confidence": "high"}'],
    ['a boolean', '{"confidence": true}'],
  ])('refuses a confidence given as %s', (_name, reply) => {
    // Number(null) is 0 and Number(true) is 1. Either would read as a real
    // score, send the lot for a photo pass it never earned, and store a
    // figure the model never gave.
    expect(() => readIdentification(reply)).toThrow(/confidence/);
  });

  it('refuses a year that cannot be right', () => {
    expect(() => readIdentification(JSON.stringify({ year: 12, confidence: 90 }))).toThrow(/year/);
  });
});

describe('deciding whether to look at the photo', () => {
  it('leaves a confident answer alone', () => {
    expect(needsPhotoPass(readIdentification(good))).toBe(false);
  });

  it('sends an unsure answer back with its photo', () => {
    const unsure = readIdentification(JSON.stringify({ confidence: PHOTO_PASS_BELOW - 1 }));
    expect(needsPhotoPass(unsure)).toBe(true);
  });

  it('takes a threshold, because the right one is not knowable yet', () => {
    const middling = readIdentification(JSON.stringify({ confidence: 75 }));
    expect(needsPhotoPass(middling, 80)).toBe(true);
    expect(needsPhotoPass(middling, 60)).toBe(false);
  });
});

describe('the words the model is given', () => {
  it('carries the lot number and title', () => {
    const prompt = userPromptFor({ lotNumber: '0001-23502418', title: '2015 Invented Wagon' });
    expect(prompt).toContain('0001-23502418');
    expect(prompt).toContain('2015 Invented Wagon');
  });

  it('carries the catalogue details', () => {
    const prompt = userPromptFor({
      lotNumber: '1',
      title: 'A lot',
      details: { odometer: '144,026', fuel: 'Diesel' },
    });
    expect(prompt).toContain('odometer: 144,026');
    expect(prompt).toContain('fuel: Diesel');
  });

  it('leaves out details the catalogue did not give', () => {
    // An empty label invites the model to fill it in, which is the one thing
    // the prompt tells it not to do.
    const prompt = userPromptFor({
      lotNumber: '1',
      title: 'A lot',
      details: { odometer: null, fuel: '', transmission: undefined },
    });
    expect(prompt).not.toContain('odometer');
    expect(prompt).not.toContain('Catalogue details');
  });
});

describe('the condition rule, which a real catalogue caught', () => {
  it('names the write off markers the model must not file as a spec', () => {
    // The first live run put "WOVR-INSPECTED" into specs and left
    // conditionNotes null. A written off vehicle is worth materially less, so
    // that fact has to land in the field the valuation reads.
    expect(SYSTEM_PROMPT).toMatch(/WOVR/);
    expect(SYSTEM_PROMPT).toMatch(/statutory write off|repairable write off/);
    expect(SYSTEM_PROMPT).toMatch(/Put it here and not in specs/);
  });

  it('asks for the catalogue own words rather than a tidied version', () => {
    // WOVR-INSPECTED and WOVR-REPAIRABLE are not the same thing.
    expect(SYSTEM_PROMPT).toMatch(/Copy the words the catalogue uses/);
  });
});
