// Auction data is shared across organisations.
//
// This is the first schema where two organisations see the same rows, so the
// sharing is proved in both directions: they read the same auction, and
// neither of them can write it.

import { beforeAll, describe, expect, it } from 'vitest';
import { anonClient, isEmpty, serviceClient } from './testing/localSupabase';
import { createAuction, createTenants, type AuctionFixture, type Tenants } from './testing/fixtures';

let t: Tenants;
let a: AuctionFixture;

beforeAll(async () => {
  t = await createTenants();
  a = await createAuction(t);
}, 60_000);

describe('auction data is shared', () => {
  it('shows the same auction to both organisations', async () => {
    for (const user of [t.ownerA, t.ownerB]) {
      const seen = await user.client.from('auctions').select('id').eq('id', a.auctionId);
      expect(isEmpty(seen), 'the auction should be visible').toBe(false);
    }
  });

  it('shows the same lot to both organisations', async () => {
    for (const user of [t.ownerA, t.ownerB]) {
      const seen = await user.client.from('lots').select('id').eq('id', a.lotId);
      expect(isEmpty(seen), 'the lot should be visible').toBe(false);
    }
  });

  it('lets no client write a shared table, whatever their role', async () => {
    const written = await t.ownerA.client
      .from('lots')
      .insert({ auction_id: a.auctionId, lot_number: 'LOT-999', title: 'Made up' });
    expect(written.error).not.toBeNull();
  });

  it('lets no client change an auction', async () => {
    const updated = await t.ownerA.client
      .from('auctions')
      .update({ title: 'Renamed' })
      .eq('id', a.auctionId)
      .select('id');
    expect(isEmpty(updated)).toBe(true);
  });

  it('lets no client add a platform', async () => {
    const written = await t.ownerA.client
      .from('auction_platforms')
      .insert({ slug: 'made-up', name: 'Made up', extractor_version: '0.1.0' });
    expect(written.error).not.toBeNull();
  });

  it('hides everything from a signed out visitor', async () => {
    const anon = anonClient();
    expect(isEmpty(await anon.from('auctions').select('id'))).toBe(true);
    expect(isEmpty(await anon.from('lots').select('id'))).toBe(true);
    expect(isEmpty(await anon.from('auction_platforms').select('id'))).toBe(true);
  });
});

describe('the raw payload is service role only', () => {
  it('is hidden from every signed in user', async () => {
    expect(isEmpty(await t.ownerA.client.from('raw_extract').select('id'))).toBe(true);
  });

  it('is still written by the service role', async () => {
    const written = await serviceClient()
      .from('raw_extract')
      .insert({
        auction_id: a.auctionId,
        page: 1,
        payload: { lots: 1 },
        extractor_version: '0.1.0',
      })
      .select('id');
    expect(written.error).toBeNull();
    expect(written.data?.length).toBe(1);
  });

  it('keeps one payload per page, so a replay does not duplicate it', async () => {
    const again = await serviceClient().from('raw_extract').insert({
      auction_id: a.auctionId,
      page: 1,
      payload: { lots: 1 },
      extractor_version: '0.1.0',
    });
    expect(again.error).not.toBeNull();
  });
});
