import { createServiceSupabase } from '@maxbid/db/server';
import { analysisSubmitted, extractRequested, inngest } from './client';

// S1 Ingest. Source: docs/02-specs/pipeline.md.
//
// The auction and analysis rows are created by the server action that accepts
// the submission. This stage marks the analysis as extracting and hands on to
// S2.
//
// Every piece of work is its own step.run, so a retry resumes from where it
// failed rather than starting again. That is what F11 means by a failed lot
// retrying without restarting the catalogue, and the shape every later stage
// follows.

export const ingest = inngest.createFunction(
  {
    id: 'ingest',
    name: 'S1 Ingest',
    triggers: [{ event: analysisSubmitted }],
    // One run per analysis, so a double submission cannot extract twice.
    concurrency: { key: 'event.data.analysisId', limit: 1 },
    retries: 3,
  },
  async ({ event, step }) => {
    const { analysisId, auctionId } = event.data;

    await step.run('mark-extracting', async () => {
      const supabase = createServiceSupabase();
      const { error } = await supabase
        .from('analyses')
        .update({ status: 'extracting', progress_pct: 5 })
        .eq('id', analysisId);
      if (error) throw new Error(`Could not mark the analysis as extracting: ${error.message}`);
    });

    await step.sendEvent('request-extract', {
      name: extractRequested.name,
      data: { analysisId, auctionId },
    });

    return { analysisId, auctionId };
  },
);
