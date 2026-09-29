// What a Claude call costs, and the ceiling that stops a runaway.
// D33 picks the provider. Decision record 0017 picks the model for triage.
//
// S4 is the first stage that spends money per lot, and a catalogue can hold
// 300 lots. A loop, a retry storm or a prompt that suddenly returns ten times
// as much text all spend real money, so the ceiling is checked before each
// call and again as the running total grows.

/** Dollars per million tokens, as published by Anthropic. */
export type ModelPrice = { inputPerMillion: number; outputPerMillion: number };

/**
 * Prices are here rather than fetched, because a cost record has to be
 * reproducible. A price change is a code change, so an old ai_runs row still
 * says what it cost at the time.
 *
 * Checked against anthropic.com/pricing on 29 September 2026.
 */
export const MODEL_PRICES: Record<string, ModelPrice> = {
  'claude-haiku-4-5-20251001': { inputPerMillion: 1, outputPerMillion: 5 },
};

/** The small model, per D33. Triage runs on every lot, so it runs on this. */
export const TRIAGE_MODEL = 'claude-haiku-4-5-20251001';

export type TokenUse = { inputTokens: number; outputTokens: number };

/**
 * What a call cost, in US dollars.
 *
 * An unknown model returns zero rather than throwing. A price we have not
 * recorded must not stop a pipeline, but it must not be guessed at either, so
 * it reads as nothing and the model name on the row says why.
 */
export function costOf(model: string, use: TokenUse): number {
  const price = MODEL_PRICES[model];
  if (!price) return 0;
  return (
    (use.inputTokens / 1_000_000) * price.inputPerMillion +
    (use.outputTokens / 1_000_000) * price.outputPerMillion
  );
}

/**
 * The most one analysis may spend on AI.
 *
 * unit-costs.md budgets $0.02 a lot for the whole of triage, including the
 * search call in S5. A 300 lot catalogue is therefore about $6. This ceiling
 * is set well above that, because it exists to stop a fault, not to enforce a
 * budget. A ceiling set near the expected cost would stop honest work.
 */
export const DEFAULT_ANALYSIS_CEILING_USD = 25;

export class SpendCeilingError extends Error {
  constructor(
    readonly spentUsd: number,
    readonly ceilingUsd: number,
  ) {
    super(
      `This analysis has spent $${spentUsd.toFixed(2)} of its $${ceilingUsd.toFixed(2)} limit, so we stopped it. Nothing further was charged.`,
    );
    this.name = 'SpendCeilingError';
  }
}

/**
 * Refuses to start another call once the ceiling is reached.
 *
 * Checked before the call rather than after, so the ceiling is a limit on what
 * is spent and not a report on what was.
 */
export function assertWithinCeiling(spentUsd: number, ceilingUsd: number): void {
  if (spentUsd >= ceilingUsd) throw new SpendCeilingError(spentUsd, ceilingUsd);
}
