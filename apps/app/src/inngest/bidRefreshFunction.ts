// Re-reading current bids on a schedule. Decision record 0026.
//
// One schedule at the finest interval in the table, which each run uses to
// re-read only the sales whose own interval has elapsed. Rolling, rather than
// four schedules that would each have to know about the other three.
//
// This reads other people's sites, so it takes its turn in the same eight
// fetches a minute as every other stage and never runs twice at once.

import { createServiceSupabase } from '@maxbid/db/server';
import { assertComplete, parseGraysCatalogue } from '../extract/grays';
import { fetchPage } from '../extract/firecrawl';
import { liveSales, needsRefresh, salesToRefresh, type SaleToRefresh } from './bidRefresh';
import { bidRefreshRequested, inngest } from './client';
import { writeLots } from './lots';

/**
 * How many sales one run may re-read.
 *
 * A cap is what stops a backlog starving extraction, valuation and the harvest
 * of their share of the fetch budget. Eight a run at ten minute intervals is
 * 48 sales an hour, which clears the 21 live sales decision record 0024
 * measured several times over.
 */
const SALES_PER_RUN = 8;

/**
 * Re-reads one sale's bids from its catalogue page.
 *
 * Reuses the extraction parser and `writeLots`, so a bid read by a refresh and
 * a bid read by an extraction come from the same code. Two parsers would be
 * two chances to read a price differently.
 *
 * A refresh that finds lots we do not hold writes them, per decision record
 * 0024. Identifying and valuing them stays the crawler's job, so they show as
 * lots we have not worked out yet rather than not at all.
 */
export async function refreshSale(auctionId: string) {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from('auctions')
    .select('source_url')
    .eq('id', auctionId)
    .single();
  if (error) throw new Error(`Could not read the auction: ${error.message}`);
  if (!data.source_url) throw new Error('That auction has no source link to fetch.');

  const page = await fetchPage(data.source_url);
  const parsed = parseGraysCatalogue(page.markdown, page.fetchedAt);
  // A page that came back short would otherwise look like a sale that lost
  // lots, and writing that would be worse than not refreshing at all.
  assertComplete(parsed);

  await writeLots(auctionId, parsed.lots, page.fetchedAt);
  return { lots: parsed.lots.length, checkedAt: page.fetchedAt };
}

export const refreshOneSale = inngest.createFunction(
  {
    id: 'refresh-bids-on-request',
    name: 'Refresh current bids for one sale',
    triggers: [{ event: bidRefreshRequested }],
    // One sale at a time, and only once for a sale however many people open
    // it at the same moment.
    concurrency: { key: 'event.data.auctionId', limit: 1 },
    retries: 1,
  },
  async ({ event, step }) => {
    const { auctionId } = event.data;

    // Checked again here, not only before the event was sent. Several people
    // opening the same sale send several events, and the first to arrive makes
    // the rest unnecessary.
    const stillDue = await step.run('still-due', async () => {
      const now = new Date();
      const sale = (await liveSales(now)).find((row) => row.auctionId === auctionId);
      return sale ? needsRefresh(sale, now) : false;
    });
    if (!stillDue) return { auctionId, refreshed: false };

    const result = await step.run('refresh', async () => refreshSale(auctionId));
    return { auctionId, refreshed: true, lots: result.lots };
  },
);

export const refreshBids = inngest.createFunction(
  {
    id: 'refresh-bids',
    name: 'Refresh current bids',
    // Every ten minutes, the finest interval in decision record 0026. A sale
    // on a slower tier is simply not due on most runs.
    triggers: [{ cron: '*/10 * * * *' }],
    // One at a time across the whole system, like the harvest. Two runs at
    // once would double the rate we ask other people's sites for pages.
    concurrency: { limit: 1 },
    // A missed run costs ten minutes and the next one picks the sale up,
    // because being due is worked out from the stored reading rather than from
    // whether a run happened. Retrying a fetch that failed is worth one go.
    retries: 1,
  },
  async ({ step }) => {
    const due = await step.run('find-sales-due', async () => {
      const now = new Date();
      return salesToRefresh(await liveSales(now), SALES_PER_RUN, now);
    });
    if (due.length === 0) return { sales: 0, lots: 0, failed: 0 };

    let lots = 0;
    let failed = 0;

    for (const sale of due as SaleToRefresh[]) {
      const result = await step
        .run(`refresh-${sale.auctionId}`, async () => refreshSale(sale.auctionId))
        // One sale whose page cannot be read must not stop the others. It
        // stays due, so the next run tries it again rather than it being
        // quietly dropped.
        .catch(() => null);
      if (result) lots += result.lots;
      else failed += 1;
    }

    return { sales: due.length - failed, lots, failed };
  },
);
