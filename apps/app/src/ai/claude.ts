// Calling Claude, and recording what it cost. D33.
//
// Every call goes through here so that no call can happen without a row in
// ai_runs. A call whose cost nobody recorded is exactly the call that empties
// an account, so the recording is not left to each stage to remember.

import Anthropic from '@anthropic-ai/sdk';
import { createServiceSupabase } from '@maxbid/db/server';
import { costOf, type TokenUse } from './pricing';

let client: Anthropic | undefined;

function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to apps/app/.env.local.');
  }
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export type CallRecord = {
  stage: string;
  promptVersion: string;
  orgId?: string | null;
  analysisId?: string | null;
  lotId?: string | null;
};

export type CallResult = {
  text: string;
  use: TokenUse;
  costUsd: number;
  aiRunId: string | null;
};

export class UnrecordedSpendError extends Error {
  constructor(cause: string) {
    super(
      `A Claude call could not be recorded, so we stopped rather than spend money we cannot account for. The database said: ${cause}`,
    );
    this.name = 'UnrecordedSpendError';
  }
}

/**
 * Writes the cost row, and throws if it cannot.
 *
 * This used to swallow the failure, on the reasoning that losing a cost row
 * should not lose the work. That was wrong. The spend ceiling is worked out
 * from these very rows, so a call nothing recorded is a call nothing can cap,
 * and the only trace of it would be the bill. Stopping on a database blip is
 * the cheaper of the two mistakes.
 */
async function record(
  where: CallRecord,
  model: string,
  use: TokenUse,
  costUsd: number,
  error?: string,
): Promise<string | null> {
  try {
    const { data, error: failed } = await createServiceSupabase()
      .from('ai_runs')
      .insert({
        org_id: where.orgId ?? null,
        analysis_id: where.analysisId ?? null,
        lot_id: where.lotId ?? null,
        stage: where.stage,
        model,
        prompt_version: where.promptVersion,
        input_tokens: use.inputTokens,
        output_tokens: use.outputTokens,
        cost_usd: costUsd,
        ok: !error,
        error: error ?? null,
      })
      .select('id')
      .single();
    if (failed) throw new UnrecordedSpendError(failed.message);
    return data?.id ?? null;
  } catch (cause) {
    if (cause instanceof UnrecordedSpendError) throw cause;
    throw new UnrecordedSpendError(cause instanceof Error ? cause.message : String(cause));
  }
}

export type AskOptions = {
  model: string;
  system: string;
  prompt: string;
  maxTokens?: number;
  /** An image the model should look at as well as the words. */
  imageUrl?: string;
};

/**
 * Asks Claude one question and records what it cost.
 *
 * A failed call is recorded too. It may have spent tokens before it failed,
 * and a stage that fails repeatedly is a cost even when it produces nothing.
 */
export async function ask(options: AskOptions, where: CallRecord): Promise<CallResult> {
  const content: Anthropic.ContentBlockParam[] = [];
  if (options.imageUrl) {
    content.push({ type: 'image', source: { type: 'url', url: options.imageUrl } });
  }
  content.push({ type: 'text', text: options.prompt });

  try {
    const response = await anthropic().messages.create({
      model: options.model,
      max_tokens: options.maxTokens ?? 1024,
      system: options.system,
      messages: [{ role: 'user', content }],
    });

    const use = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
    const costUsd = costOf(options.model, use);
    const aiRunId = await record(where, options.model, use, costUsd);

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return { text, use, costUsd, aiRunId };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    // A failed call is recorded too. It may have spent tokens before it
    // failed, and a stage that fails over and over is a cost even when it
    // produces nothing. If that record cannot be written either, the
    // unrecorded spend is the more serious of the two problems, so it is the
    // one that surfaces, carrying the original failure in its message.
    await record(
      where,
      options.model,
      { inputTokens: 0, outputTokens: 0 },
      0,
      message,
    ).catch((recordFailure: unknown) => {
      throw new UnrecordedSpendError(
        `${recordFailure instanceof Error ? recordFailure.message : String(recordFailure)}. The call itself failed with: ${message}`,
      );
    });
    throw cause;
  }
}

/** What an analysis has spent on AI so far, which the ceiling is checked against. */
export async function spentOnAnalysis(analysisId: string): Promise<number> {
  const { data, error } = await createServiceSupabase()
    .from('ai_runs')
    .select('cost_usd')
    .eq('analysis_id', analysisId);
  if (error) throw new Error(`Could not read what this analysis has spent: ${error.message}`);
  return (data ?? []).reduce((total, row) => total + Number(row.cost_usd ?? 0), 0);
}
