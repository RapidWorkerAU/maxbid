import { createServiceSupabase } from '@maxbid/db/server';
import { assertComplete, parseGraysCatalogue } from '../extract/grays';
import { fetchPage } from '../extract/firecrawl';
import { extractRequested, inngest, triageRequested } from './client';
import { openAnalysisLots, writeLots } from './lots';
import { readAuctionTerms } from './normalise';

export { lotRows } from './lots';

// S2 Extract and S3 Normalise. Source: docs/02-specs/pipeline.md.
//
// Fetch the catalogue, keep exactly what came back in raw_extract, then map it
// to lot rows. Storing the payload first is the point of decision record 0011:
// if parsing breaks, the pages can be reprocessed without fetching a site we
// promised in D45 to treat carefully.

// 1.1.0 added the card layout that the motor vehicle sales use. 1.2.0 added
// S3, which reads the premium schedule off a lot page. A stored page records
// the version that read it, so a reprocess knows what it is replacing.
export const EXTRACTOR_VERSION = 'grays-markdown-1.2.0';

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
      // The fetch time matters: a motor vehicle catalogue gives closing times
      // as a countdown, which only means something alongside it.
      const parsed = parseGraysCatalogue(page.markdown, page.fetchedAt);
      // Throws when the page came back short. Better no catalogue than a
      // quietly incomplete one, which a user would bid against.
      assertComplete(parsed);
      return parsed.lots;
    });

    const lotIdsByNumber = await step.run('write-lots', async () => writeLots(auctionId, lots));

    // What a lot is worth to one organisation is theirs, and these rows hold
    // it. Nothing created them before, so triage had nowhere to write to.
    await step.run('open-analysis-lots', async () =>
      openAnalysisLots(analysisId, Object.values(lotIdsByNumber)),
    );

    // S3. The premium lives on a lot page rather than the catalogue, so this
    // reads one lot to learn what the whole auction charges. F10, D25.
    const terms = await step.run('read-auction-terms', async () => {
      const first = lots[0];
      if (!first?.lotUrl) return { premiumSource: 'platform_default', bands: 0, title: null };
      return readAuctionTerms(auctionId, first.lotUrl);
    });

    await step.run('mark-extracted', async () => {
      const supabase = createServiceSupabase();
      const { error } = await supabase
        .from('analyses')
        .update({ status: 'triaging', progress_pct: 25 })
        .eq('id', analysisId);
      if (error) throw new Error(`Could not update the analysis: ${error.message}`);
    });

    // S4 identifies every lot. It needs the organisation, because what it
    // spends is charged to them and ai_runs records it against them.
    const orgId = await step.run('find-organisation', async () => {
      const supabase = createServiceSupabase();
      const { data, error } = await supabase
        .from('analyses')
        .select('org_id')
        .eq('id', analysisId)
        .single();
      if (error) throw new Error(`Could not read the analysis: ${error.message}`);
      return data.org_id;
    });

    await step.sendEvent('start-triage', {
      name: triageRequested.name,
      data: { analysisId, auctionId, orgId },
    });

    return { analysisId, auctionId, lots: lots.length, terms };
  },
);
