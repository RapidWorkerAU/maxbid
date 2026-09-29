import type { Json } from '@maxbid/db';
import { createServiceSupabase } from '@maxbid/db/server';
import { assertComplete, parseGraysCatalogue, type ParsedLot } from '../extract/grays';
import { fetchPage } from '../extract/firecrawl';
import { extractRequested, inngest } from './client';

// S2 Extract and S3 Normalise. Source: docs/02-specs/pipeline.md.
//
// Fetch the catalogue, keep exactly what came back in raw_extract, then map it
// to lot rows. Storing the payload first is the point of decision record 0011:
// if parsing breaks, the pages can be reprocessed without fetching a site we
// promised in D45 to treat carefully.

export const EXTRACTOR_VERSION = 'grays-markdown-1.0.0';

/** Lots are written in batches, so one huge catalogue is not one huge insert. */
const BATCH_SIZE = 100;

export function lotRows(auctionId: string, lots: ParsedLot[]) {
  return lots.map((lot) => ({
    auction_id: auctionId,
    lot_number: lot.lotNumber,
    title: lot.title,
    source_url: lot.lotUrl,
    closes_at: lot.closesAt ?? null,
    current_bid: lot.currentBid ?? null,
    // The slice of the payload that produced this lot. The whole page lives
    // in raw_extract.
    raw: { ...lot } as Json,
  }));
}

export const extract = inngest.createFunction(
  {
    id: 'extract',
    name: 'S2 Extract and normalise',
    triggers: [{ event: extractRequested }],
    concurrency: { key: 'event.data.auctionId', limit: 1 },
    retries: 3,
    onFailure: async ({ event, step }) => {
      // A failed extraction must not leave an analysis sitting at extracting
      // forever. ux-standards.md says an error states what happened.
      const analysisId = event.data.event.data.analysisId;
      await step.run('mark-failed', async () => {
        const supabase = createServiceSupabase();
        await supabase.from('analyses').update({ status: 'failed' }).eq('id', analysisId);
      });
    },
  },
  async ({ event, step }) => {
    const { analysisId, auctionId } = event.data;

    const sourceUrl = await step.run('find-source-url', async () => {
      const supabase = createServiceSupabase();
      const { data, error } = await supabase
        .from('auctions')
        .select('source_url')
        .eq('id', auctionId)
        .single();
      if (error) throw new Error(`Could not read the auction: ${error.message}`);
      if (!data.source_url) throw new Error('That auction has no source link to fetch.');
      return data.source_url;
    });

    const page = await step.run('fetch-catalogue', async () => fetchPage(sourceUrl));

    // Kept before parsing, deliberately. A parse that breaks later can be
    // replayed from here rather than refetching.
    await step.run('store-payload', async () => {
      const supabase = createServiceSupabase();
      const { error } = await supabase.from('raw_extract').upsert(
        {
          auction_id: auctionId,
          source_url: page.url,
          page: 1,
          payload: { markdown: page.markdown, fetchedAt: page.fetchedAt },
          extractor_version: EXTRACTOR_VERSION,
        },
        { onConflict: 'auction_id,page' },
      );
      if (error) throw new Error(`Could not store the payload: ${error.message}`);
    });

    const lots = await step.run('parse-catalogue', async () => {
      const parsed = parseGraysCatalogue(page.markdown);
      // Throws when the page came back short. Better no catalogue than a
      // quietly incomplete one, which a user would bid against.
      assertComplete(parsed);
      return parsed.lots;
    });

    await step.run('write-lots', async () => {
      const supabase = createServiceSupabase();
      const rows = lotRows(auctionId, lots);
      for (let start = 0; start < rows.length; start += BATCH_SIZE) {
        const { error } = await supabase
          .from('lots')
          .upsert(rows.slice(start, start + BATCH_SIZE), { onConflict: 'auction_id,lot_number' });
        if (error) throw new Error(`Could not write the lots: ${error.message}`);
      }
    });

    await step.run('mark-extracted', async () => {
      const supabase = createServiceSupabase();
      const { error } = await supabase
        .from('analyses')
        .update({ status: 'triaging', progress_pct: 25 })
        .eq('id', analysisId);
      if (error) throw new Error(`Could not update the analysis: ${error.message}`);
    });

    return { analysisId, auctionId, lots: lots.length };
  },
);
