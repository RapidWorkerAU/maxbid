// Credit movements, and who may write them. F17.
//
// A balance is the sum of the ledger and is never stored, so what matters
// here is that nobody can add to it, change it or take a row out of it.

import { beforeAll, describe, expect, it } from 'vitest';
import { isEmpty, serviceClient } from './testing/localSupabase';
import { createTenants, type Tenants } from './testing/fixtures';

let t: Tenants;

beforeAll(async () => {
  t = await createTenants();
  const granted = await serviceClient()
    .from('credit_ledger')
    .insert({ org_id: t.orgA, delta: 100, reason: 'plan_grant' });
  if (granted.error) throw granted.error;
}, 60_000);

describe('a balance is the sum of the ledger', () => {
  it('counts a grant', async () => {
    const { data, error } = await serviceClient().rpc('credits_available', { target_org: t.orgA });
    expect(error).toBeNull();
    expect(data).toBe(100);
  });

  it('counts a use against it', async () => {
    const used = await serviceClient()
      .from('credit_ledger')
      .insert({ org_id: t.orgA, delta: -30, reason: 'reserve' });
    expect(used.error).toBeNull();

    const { data } = await serviceClient().rpc('credits_available', { target_org: t.orgA });
    expect(data).toBe(70);
  });

  it('counts a refund back', async () => {
    const refunded = await serviceClient()
      .from('credit_ledger')
      .insert({ org_id: t.orgA, delta: 10, reason: 'refund' });
    expect(refunded.error).toBeNull();

    const { data } = await serviceClient().rpc('credits_available', { target_org: t.orgA });
    expect(data).toBe(80);
  });

  it('is nought for an organisation with no movements', async () => {
    // Nought rather than null, so nothing downstream has to guess what an
    // empty ledger means.
    const { data } = await serviceClient().rpc('credits_available', { target_org: t.orgB });
    expect(data).toBe(0);
  });
});

describe('who may read a balance', () => {
  it('lets an organisation read its own movements', async () => {
    const seen = await t.ownerA.client.from('credit_ledger').select('delta').eq('org_id', t.orgA);
    expect(isEmpty(seen), 'a balance nobody can see is one nobody can plan against').toBe(false);
  });

  it('keeps them from another organisation', async () => {
    const seen = await t.ownerB.client.from('credit_ledger').select('delta').eq('org_id', t.orgA);
    expect(isEmpty(seen), 'what another organisation has is not theirs to see').toBe(true);
  });
});

describe('what nobody may do', () => {
  it('lets nobody grant themselves credits', async () => {
    // Credits a user could grant themselves would not be credits.
    const written = await t.ownerA.client
      .from('credit_ledger')
      .insert({ org_id: t.orgA, delta: 1000, reason: 'plan_grant' });
    expect(written.error).not.toBeNull();
  });

  it('lets nobody change a movement that has happened', async () => {
    const changed = await t.ownerA.client
      .from('credit_ledger')
      .update({ delta: 9999 })
      .eq('org_id', t.orgA);
    const { data } = await serviceClient().rpc('credits_available', { target_org: t.orgA });
    expect(changed.error !== null || data === 80).toBe(true);
  });

  it('lets nobody take a movement out of the ledger', async () => {
    // Append only is the whole point. A reserve somebody could delete is a
    // free deep analysis.
    const removed = await t.ownerA.client.from('credit_ledger').delete().eq('org_id', t.orgA);
    const { data } = await serviceClient().rpc('credits_available', { target_org: t.orgA });
    expect(removed.error !== null || data === 80).toBe(true);
  });
});

describe('what the ledger refuses to hold', () => {
  it('refuses a movement of nothing', async () => {
    // A row that changes no balance only makes the ledger harder to read.
    const written = await serviceClient()
      .from('credit_ledger')
      .insert({ org_id: t.orgA, delta: 0, reason: 'adjustment' });
    expect(written.error).not.toBeNull();
  });

  it('refuses a reason it does not recognise', async () => {
    const written = await serviceClient()
      .from('credit_ledger')
      .insert({ org_id: t.orgA, delta: 5, reason: 'because' });
    expect(written.error).not.toBeNull();
  });

  it('records an expiry without applying it yet', async () => {
    // commercial.md expires plan credits after a month. The column is right
    // from the first row; the balance does not read it yet, and the migration
    // says why.
    const expired = await serviceClient().from('credit_ledger').insert({
      org_id: t.orgB,
      delta: 50,
      reason: 'plan_grant',
      expires_at: '2020-01-01T00:00:00.000Z',
    });
    expect(expired.error).toBeNull();

    const { data } = await serviceClient().rpc('credits_available', { target_org: t.orgB });
    expect(data).toBe(50);
  });
});
