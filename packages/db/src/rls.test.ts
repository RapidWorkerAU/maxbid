// Tenant isolation.
//
// R11, a cross tenant data leak, is scored impact 5 in the risk register, and
// F02 says two members of one organisation see the same analyses while other
// organisations see nothing. These tests are how that claim is checked.

import { beforeAll, describe, expect, it } from 'vitest';
import { anonClient, isEmpty } from './testing/localSupabase';
import { createTenants, type Tenants } from './testing/fixtures';

let t: Tenants;

beforeAll(async () => {
  t = await createTenants();
}, 60_000);

describe('one organisation cannot see another', () => {
  it('hides the other organisation itself', async () => {
    const mine = await t.ownerA.client.from('organisations').select('id');
    expect(mine.data?.map((row) => row.id)).toEqual([t.orgA]);

    const theirs = await t.ownerB.client.from('organisations').select('id').eq('id', t.orgA);
    expect(isEmpty(theirs)).toBe(true);
  });

  it('hides the other organisation cost profiles', async () => {
    const theirs = await t.ownerB.client.from('cost_profiles').select('id').eq('org_id', t.orgA);
    expect(isEmpty(theirs)).toBe(true);
  });

  it('hides the other organisation memberships', async () => {
    const theirs = await t.ownerB.client
      .from('organisation_members')
      .select('user_id')
      .eq('org_id', t.orgA);
    expect(isEmpty(theirs)).toBe(true);
  });

  it('refuses a write into the other organisation', async () => {
    const written = await t.ownerB.client
      .from('cost_profiles')
      .insert({ org_id: t.orgA, name: 'Sneaky', is_default: false });
    expect(written.error).not.toBeNull();
  });

  it('refuses an update to the other organisation rows', async () => {
    const updated = await t.ownerB.client
      .from('cost_profiles')
      .update({ name: 'Renamed' })
      .eq('id', t.profileA)
      .select('id');
    expect(isEmpty(updated)).toBe(true);
  });

  it('refuses to add itself to the other organisation', async () => {
    const written = await t.ownerB.client
      .from('organisation_members')
      .insert({ org_id: t.orgA, user_id: t.ownerB.id, role: 'owner' });
    expect(written.error).not.toBeNull();
  });

  it('shows members of one organisation to each other', async () => {
    const seen = await t.buyerA.client
      .from('organisation_members')
      .select('user_id')
      .eq('org_id', t.orgA);
    expect(seen.data?.length).toBe(3);
  });
});

describe('a signed out visitor sees nothing', () => {
  it('reads no organisations', async () => {
    expect(isEmpty(await anonClient().from('organisations').select('id'))).toBe(true);
  });

  it('reads no cost profiles', async () => {
    expect(isEmpty(await anonClient().from('cost_profiles').select('id'))).toBe(true);
  });

  it('reads no memberships', async () => {
    expect(isEmpty(await anonClient().from('organisation_members').select('user_id'))).toBe(true);
  });
});

describe('profiles', () => {
  it('shows a co-member their team mate', async () => {
    const seen = await t.buyerA.client.from('profiles').select('id').eq('id', t.ownerA.id);
    expect(isEmpty(seen)).toBe(false);
  });

  it('hides someone from another organisation', async () => {
    const seen = await t.ownerB.client.from('profiles').select('id').eq('id', t.ownerA.id);
    expect(isEmpty(seen)).toBe(true);
  });
});
