// S7 Harvest results, as a scheduled Inngest function. Decision record 0021.
//
// Runs on its own rather than waiting to be asked, because the value of the
// archive is that it never misses a sale. A sale read late is still read; a
// sale nobody remembered to read is gone, since a closed lot page is the only
// record and nothing guarantees it stays up.

import { createServiceSupabase } from '@maxbid/db/server';
import { inngest } from './client';
import {
  harvestLot,
  markHarvested,
  salesReadyToHarvest,
  storeResult,
  type LotToHarvest,
} from './harvest';

/** How many sales to read in one run. Kind to the sites we are reading. */
const SALES_PER_RUN = 3;

/** How many lots of a sale are read at once. */
const AT_A_TIME = 4;

export const harvestResults = inngest.createFunction(
  {
    id: 'harvest-results',
    name: 'S7 Harvest auction results',
    // Hourly. Sales close at all hours, and an hour late costs nothing,
    // where missing a sale costs the only record of what its lots fetched.
    triggers: [{ cron: '0 * * * *' }],
    // One at a time across the whole system. This reads other people's sites,
    // and two runs at once would double the rate we ask them for pages.
    concurrency: { limit: 1 },
    retries: 2,
  },
  async ({ step }) => {
    const sales = await step.run('find-sales', async () => salesReadyToHarvest(SALES_PER_RUN));
    if (sales.length === 0) return { sales: 0, lots: 0, sold: 0, unsold: 0 };

    let read = 0;
    let sold = 0;
    let unsold = 0;

    for (const sale of sales) {
      const lots = await step.run(`lots-${sale.id}`, async () => {
        const supabase = createServiceSupabase();
        const { data, error } = await supabase
          .from('lots')
          .select('id, lot_number, source_url')
          .eq('auction_id', sale.id)
          .is('did_not_sell', null)
          .is('sold_price', null);
        if (error) throw new Error(`Could not read the lots: ${error.message}`);
        return (data ?? []) as LotToHarvest[];
      });

      for (let start = 0; start < lots.length; start += AT_A_TIME) {
        const batch = lots.slice(start, start + AT_A_TIME);
        const results = await Promise.all(
          batch.map((lot) =>
            step
              .run(`result-${lot.lot_number}`, async () => {
                const harvested = await harvestLot(lot);
                if (!harvested) return { read: false, sold: false };
                await storeResult(harvested);
                return { read: true, sold: !harvested.didNotSell };
              })
              // One lot we cannot read must not cost us the other 299, and the
              // next run picks it up again because it is still unrecorded.
              .catch(() => ({ read: false, sold: false })),
          ),
        );

        for (const result of results) {
          if (!result.read) continue;
          read += 1;
          if (result.sold) sold += 1;
          else unsold += 1;
        }
      }

      await step.run(`mark-${sale.id}`, async () => markHarvested(sale.id, read));
    }

    return { sales: sales.length, lots: read, sold, unsold };
  },
);
