import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ANALYSIS_CEILING_USD,
  MODEL_PRICES,
  SpendCeilingError,
  TRIAGE_MODEL,
  assertWithinCeiling,
  costOf,
} from './pricing';

describe('what a call cost', () => {
  it('prices a call from its tokens', () => {
    // Haiku 4.5 at $1 and $5 per million.
    expect(costOf(TRIAGE_MODEL, { inputTokens: 1_000_000, outputTokens: 0 })).toBeCloseTo(1, 10);
    expect(costOf(TRIAGE_MODEL, { inputTokens: 0, outputTokens: 1_000_000 })).toBeCloseTo(5, 10);
  });

  it('prices a call the size triage actually makes', () => {
    // Around 400 in and 120 out, which is what one lot looks like.
    expect(costOf(TRIAGE_MODEL, { inputTokens: 400, outputTokens: 120 })).toBeCloseTo(0.001, 6);
  });

  it('reads a model it has no price for as nothing, rather than guessing', () => {
    // A price we have not recorded must not stop a pipeline, and must not be
    // invented either. The model name on the row says why the figure is zero.
    expect(costOf('some-model-we-have-not-priced', { inputTokens: 1000, outputTokens: 1000 })).toBe(0);
  });

  it('has a price for the model triage uses', () => {
    expect(MODEL_PRICES[TRIAGE_MODEL]).toBeDefined();
  });
});

describe('the ceiling that stops a runaway', () => {
  it('lets an analysis under the ceiling carry on', () => {
    expect(() => assertWithinCeiling(1.5, 25)).not.toThrow();
  });

  it('stops one that has reached it', () => {
    expect(() => assertWithinCeiling(25, 25)).toThrow(SpendCeilingError);
  });

  it('says plainly what happened and that nothing more was charged', () => {
    // CP11: the message a user sees says what happened, not a code.
    expect(() => assertWithinCeiling(25.4, 25)).toThrow(
      /spent \$25\.40 of its \$25\.00 limit[\s\S]*Nothing further was charged/,
    );
  });

  it('sits well above what a full catalogue should cost', () => {
    // unit-costs.md budgets $0.02 a lot for the whole of triage, so a 300 lot
    // catalogue is about $6. The ceiling exists to stop a fault, not to
    // enforce a budget, and one set near the expected cost would stop honest
    // work instead.
    const fullCatalogue = 300 * 0.02;
    expect(DEFAULT_ANALYSIS_CEILING_USD).toBeGreaterThan(fullCatalogue * 3);
  });
});
