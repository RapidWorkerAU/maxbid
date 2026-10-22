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

  // The fixture already joins that analysis to that lot, and only one row may
  // do so, so this reads it rather than making a second one.
  analysisLotId = a.analysisLotId;
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
  /**
   * Tries to record an outcome against a lot that has none yet.
   *
   * Every refusal needs its own lot. One outcome per analysis lot, and only
   * one analysis lot per analysis and lot pair, so reusing either would make
   * the insert fail on the uniqueness rule instead of on the rule being
   * tested, and the test would pass whether or not that rule existed.
   *
   * It throws rather than falling back when the setup fails, for the same
   * reason: a refusal test that silently tests nothing is worse than no test.
   */
  async function record(values: Record<string, unknown>) {
    const admin = serviceClient();
    const lot = await admin
      .from('lots')
      .insert({
        auction_id: a.auctionId,
        lot_number: `LOT-${crypto.randomUUID().slice(0, 8)}`,
        title: 'Another edgebander',
      })
      .select('id')
      .single();
    if (lot.error) throw lot.error;

    const analysisLot = await admin
      .from('analysis_lots')
      .insert({ analysis_id: a.analysisId, lot_id: lot.data.id, status: 'triaged' })
      .select('id')
      .single();
    if (analysisLot.error) throw analysisLot.error;

    return admin.from('outcomes').insert({ analysis_lot_id: analysisLot.data.id, ...values });
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
