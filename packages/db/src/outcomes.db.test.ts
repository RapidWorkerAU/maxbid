// What a user records about a lot they bought.
//
// The only table in the pipeline the user writes. Everything else is evidence
// gathered by the background jobs, and a price a user could write would not be
// evidence. This is the opposite: what they paid and what they made is theirs
// and nothing else can know it. F37.

import { beforeAll, describe, expect, it } from 'vitest';
import { isEmpty, serviceClient } from './testing/localSupabase';
import { createAuction, createTenants, type AuctionFixture, type Tenants } from './testing/fixtures';

let t: Tenants;
let a: AuctionFixture;
let analysisLotId: string;

beforeAll(async () => {
  t = await createTenants();
  a = await createAuction(t);

  const row = await serviceClient()
    .from('analysis_lots')
    .insert({ analysis_id: a.analysisId, lot_id: a.lotId, status: 'triaged' })
    .select('id')
    .single();
  if (row.error) throw row.error;
  analysisLotId = row.data.id;
}, 60_000);

describe('the user records what happened', () => {
  it('lets the owner record a lot they won', async () => {
    const written = await t.ownerA.client.from('outcomes').insert({
      analysis_lot_id: analysisLotId,
      result: 'won',
      hammer_price: 12800,
      actual_costs: 900,
    });
    expect(written.error).toBeNull();
  });

  it('shows it back to them', async () => {
    const seen = await t.ownerA.client
      .from('outcomes')
      .select('id')
      .eq('analysis_lot_id', analysisLotId);
    expect(isEmpty(seen), 'the owner should see their own outcome').toBe(false);
  });

  it('hides it from another organisation', async () => {
    const seen = await t.ownerB.client
      .from('outcomes')
      .select('id')
      .eq('analysis_lot_id', analysisLotId);
    expect(isEmpty(seen), 'what somebody paid is their own business').toBe(true);
  });

  it('refuses one written against an analysis that is not theirs', async () => {
    const written = await t.ownerB.client
      .from('outcomes')
      .insert({ analysis_lot_id: analysisLotId, result: 'won' });
    expect(written.error).not.toBeNull();
  });

  it('lets them correct it', async () => {
    const changed = await t.ownerA.client
      .from('outcomes')
      .update({ resale_price: 18500, sold_at: '2026-10-20' })
      .eq('analysis_lot_id', analysisLotId);
    expect(changed.error).toBeNull();
  });
});

describe('what the record refuses to hold', () => {
  async function record(values: Record<string, unknown>) {
    const admin = serviceClient();
    const lot = await admin
      .from('analysis_lots')
      .insert({ analysis_id: a.analysisId, lot_id: a.lotId, status: 'triaged' })
      .select('id')
      .single();
    // One outcome per lot per analysis, so a second lot is needed each time.
    const id = lot.data?.id ?? analysisLotId;
    return admin.from('outcomes').insert({ analysis_lot_id: id, ...values });
  }

  it('refuses a result it does not recognise', async () => {
    const written = await record({ result: 'maybe' });
    expect(written.error).not.toBeNull();
  });

  it('refuses a resale price on a lot they did not buy', async () => {
    // Recording one would put a figure on a trade that never happened.
    const written = await record({
      result: 'lost',
      resale_price: 18500,
      sold_at: '2026-10-20',
    });
    expect(written.error).not.toBeNull();
  });

  it('refuses a resale price with no date', async () => {
    // A price that cannot be aged says much less than it appears to.
    const written = await record({ result: 'won', resale_price: 18500 });
    expect(written.error).not.toBeNull();
  });

  it('refuses a sale date with no price', async () => {
    const written = await record({ result: 'won', sold_at: '2026-10-20' });
    expect(written.error).not.toBeNull();
  });

  it('refuses a price below nothing', async () => {
    const written = await record({ result: 'won', hammer_price: -100 });
    expect(written.error).not.toBeNull();
  });

  it('refuses a second outcome for the same lot', async () => {
    // A correction replaces what happened rather than adding a second
    // account of it.
    const written = await serviceClient()
      .from('outcomes')
      .insert({ analysis_lot_id: analysisLotId, result: 'lost' });
    expect(written.error).not.toBeNull();
  });

  it('does not share anything unless the user says so', async () => {
    const { data } = await serviceClient()
      .from('outcomes')
      .select('share_anonymised')
      .eq('analysis_lot_id', analysisLotId)
      .single();
    expect(data?.share_anonymised).toBe(false);
  });
});
