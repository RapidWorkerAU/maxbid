// What each role may write, and that terms acceptance stays personal.
//
// F03 says a viewer cannot edit costs or spend credits. CS26 lets an owner,
// admin or buyer edit cost profiles. Only owners and admins write settings.

import { beforeAll, describe, expect, it } from 'vitest';
import { isEmpty } from './testing/localSupabase';
import { createTenants, type Tenants } from './testing/fixtures';

let t: Tenants;

beforeAll(async () => {
  t = await createTenants();
}, 60_000);

describe('roles decide who may write', () => {
  it('lets a buyer edit cost profiles', async () => {
    const written = await t.buyerA.client
      .from('cost_profiles')
      .insert({ org_id: t.orgA, name: 'Small tools', is_default: false })
      .select('id');
    expect(written.error).toBeNull();
    expect(written.data?.length).toBe(1);
  });

  it('stops a viewer editing cost profiles', async () => {
    const written = await t.viewerA.client
      .from('cost_profiles')
      .insert({ org_id: t.orgA, name: 'Viewer attempt', is_default: false });
    expect(written.error).not.toBeNull();
  });

  it('lets a viewer read them', async () => {
    const read = await t.viewerA.client.from('cost_profiles').select('id').eq('org_id', t.orgA);
    expect((read.data ?? []).length).toBeGreaterThan(0);
  });

  it('stops a buyer writing organisation settings', async () => {
    const written = await t.buyerA.client.from('org_settings').insert({
      org_id: t.orgA,
      key: 'default_target_profit',
      value: 1000,
      updated_by: t.buyerA.id,
    });
    expect(written.error).not.toBeNull();
  });

  it('lets an owner write organisation settings', async () => {
    const written = await t.ownerA.client
      .from('org_settings')
      .insert({
        org_id: t.orgA,
        key: 'default_resale_scenario',
        value: '"conservative"',
        updated_by: t.ownerA.id,
      })
      .select('key');
    expect(written.error).toBeNull();
  });

  it('lets a viewer read the settings, so the interface can show what is locked', async () => {
    const read = await t.viewerA.client.from('org_settings').select('key').eq('org_id', t.orgA);
    expect(read.error).toBeNull();
  });
});

describe('terms acceptance is personal', () => {
  it('lets a user record their own acceptance', async () => {
    const written = await t.ownerA.client
      .from('terms_acceptances')
      .insert({ user_id: t.ownerA.id, version: '1.0.0' })
      .select('version');
    expect(written.error).toBeNull();
  });

  it('stops a user recording an acceptance for somebody else', async () => {
    const written = await t.buyerA.client
      .from('terms_acceptances')
      .insert({ user_id: t.ownerA.id, version: '1.0.0' });
    expect(written.error).not.toBeNull();
  });

  it('hides one user acceptance from another', async () => {
    const seen = await t.buyerA.client.from('terms_acceptances').select('user_id');
    expect(seen.data?.every((row) => row.user_id === t.buyerA.id)).toBe(true);
  });

  it('shows every signed in user the terms versions', async () => {
    const seen = await t.viewerA.client.from('terms_versions').select('version');
    expect(isEmpty(seen)).toBe(false);
  });
});
