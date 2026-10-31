// Working a lot's figures out again after somebody corrected it. F19.
//
// A corrected identification that left the old figures on screen would be
// worse than no correction at all, because the figures would then be
// attributed to something the user had told us was wrong.
//
// One lot, not a catalogue, because a correction is about one lot. It skips
// the stored range deliberately: the whole point is that the answer we hold
// was worked out from an identification the user has since disagreed with.

import { createServiceSupabase } from '@maxbid/db/server';
import { inngest, revalueRequested } from './client';
import { identificationsFor } from './sharedIdentification';
import { readContext } from './valueFunction';
import { valueAndStore, type LotToValue } from './valueOneLot';

export const revalue = inngest.createFunction(
  {
    id: 'revalue-lot',
    name: 'Value one lot again',
    triggers: [{ event: revalueRequested }],
    // One lot at a time, so two quick corrections to the same lot do not
    // race each other to write the range.
    concurrency: { key: 'event.data.lotId', limit: 1 },
    retries: 1,
  },
  async ({ event, step }) => {
    const { analysisId, lotId } = event.data;

    const found = await step.run('read-the-correction', async () => {
      const supabase = createServiceSupabase();
      const { data: analysis, error } = await supabase
        .from('analyses')
        .select('auction_id, org_id')
        .eq('id', analysisId)
        .single();
      if (error) throw new Error(`Could not read the analysis: ${error.message}`);

      const identifications = await identificationsFor(analysis.auction_id, analysisId);
      const identification = identifications.find((row) => row.lot_id === lotId);

      const { data: lot } = await supabase
        .from('lots')
        .select('title, raw, current_bid')
        .eq('id', lotId)
        .maybeSingle();

      return { orgId: analysis.org_id, identification, lot };
    });

    // Nothing to work from. A correction that named neither a make nor a
    // model is refused before it is saved, so this is a lot whose row went
    // missing rather than a correction we disagree with.
    if (!found.identification || !found.lot) {
      return { analysisId, lotId, valued: false, why: 'nothing to value from' };
    }

    const context = await step.run('read-context', async () =>
      readContext(analysisId, found.orgId),
    );

    const valued = await step.run('value-it-again', async () => {
      const lot = { ...found.identification, lots: found.lot } as unknown as LotToValue;
      const range = await valueAndStore(lot, { orgId: found.orgId, analysisId }, context);
      return range !== null;
    });

    return { analysisId, lotId, valued };
  },
);
