// Reading what a model saw in a lot's photographs. F18, D10.

import { describe, expect, it } from 'vitest';
import { DEEP_SYSTEM_PROMPT, deepPromptFor, readDeepIdentification } from './deepIdentify';

const answer = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    brand: 'Invented',
    model: 'Hauler Alpha',
    year: 2019,
    variant: 'Laramie',
    specs: { fuel: 'Diesel', odometer: '171,033 km' },
    conditionNotes: 'Hail damage to the bonnet.',
    readFromPlate: 'Build plate reads 2019, 3.0L V6 turbo diesel.',
    confidence: 93,
    ...over,
  });

describe('reading the answer', () => {
  it('reads what the model saw', () => {
    expect(readDeepIdentification(answer())).toMatchObject({
      brand: 'Invented',
      variant: 'Laramie',
      year: 2019,
      confidence: 93,
    });
  });

  it('reads what was legible on the plate, which is the point of looking', () => {
    // D10 exists because a model number is often only on a plate in a photo.
    expect(readDeepIdentification(answer()).readFromPlate).toContain('Build plate');
  });

  it('strips a code fence the model was asked not to use', () => {
    const fenced = '```json\n' + answer() + '\n```';
    expect(readDeepIdentification(fenced).brand).toBe('Invented');
  });

  it('reads an empty string as nothing rather than as an answer', () => {
    const vague = readDeepIdentification(answer({ variant: '   ', readFromPlate: '' }));
    expect(vague.variant).toBeNull();
    expect(vague.readFromPlate).toBeNull();
  });
});

describe('what it refuses to accept', () => {
  it('refuses a reply that is not JSON', () => {
    expect(() => readDeepIdentification('It looks like a ute.')).toThrow();
  });

  it('refuses a confidence that is not a number', () => {
    // Number(null) is 0, which would read as a real score of nought and
    // store a figure the model never gave.
    expect(() => readDeepIdentification(answer({ confidence: null }))).toThrow();
    expect(() => readDeepIdentification(answer({ confidence: '93' }))).toThrow();
  });

  it('refuses a confidence outside nought to a hundred', () => {
    expect(() => readDeepIdentification(answer({ confidence: 140 }))).toThrow();
    expect(() => readDeepIdentification(answer({ confidence: -1 }))).toThrow();
  });

  it('reads a year it cannot make sense of as nothing', () => {
    expect(readDeepIdentification(answer({ year: 'recent' })).year).toBeNull();
  });

  it('reads specs that are not an object as nothing', () => {
    expect(readDeepIdentification(answer({ specs: 'diesel' })).specs).toEqual({});
  });
});

describe('what the model is asked', () => {
  it('tells it to report what it can see and not what it expects', () => {
    // A specification we assumed will be searched for and priced as though
    // somebody had read it.
    expect(DEEP_SYSTEM_PROMPT).toContain('leave it out rather than supplying');
  });

  it('says what each confidence band means, so the figure means something', () => {
    expect(DEEP_SYSTEM_PROMPT).toContain('90 or');
    expect(DEEP_SYSTEM_PROMPT).toContain('Below 60');
  });

  it('names the plates and labels worth looking for', () => {
    expect(DEEP_SYSTEM_PROMPT).toContain('Compliance plates');
  });

  it('gives the model what the catalogue said and what triage read', () => {
    const prompt = deepPromptFor(
      {
        lotNumber: '0018-1',
        title: '2019 Invented Hauler Alpha Diesel',
        triage: { brand: 'Invented', model: 'Hauler Alpha', year: 2019 },
        details: { odometer: '171,033 km' },
      },
      12,
    );
    expect(prompt).toContain('171,033 km');
    expect(prompt).toContain('Confirm or correct');
    expect(prompt).toContain('are 12 photographs');
  });

  it('says so plainly when nothing has identified it yet', () => {
    const prompt = deepPromptFor({ lotNumber: '0018-1', title: 'A pallet of parts' }, 1);
    expect(prompt).toContain('Nothing has identified it yet');
    expect(prompt).toContain('is 1 photograph');
  });
});
