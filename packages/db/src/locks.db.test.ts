// Organisation lock tests.
//
// F52 says a buyer cannot save a value below a Floor lock through the
// interface or the API. These tests go straight to the API, so they prove the
// database is doing the work rather than the interface.

import { beforeAll, describe, expect, it } from 'vitest';
import {
  addMember,
  createOrganisation,
  createUser,
  serviceClient,
  type TestUser,
} from './testing/localSupabase';

let org: string;
let owner: TestUser;
let buyer: TestUser;

async function setLock(key: string, value: unknown, lockType: 'none' | 'fixed' | 'floor') {
  const admin = serviceClient();
  const { error } = await admin
    .from('org_settings')
    .upsert({ org_id: org, key, value, lock_type: lockType, updated_by: owner.id });
  if (error) throw error;
}

function savePreference(user: TestUser, key: string, value: unknown) {
  return user.client.from('user_preferences').upsert({ user_id: user.id, org_id: org, key, value });
}

beforeAll(async () => {
  org = await createOrganisation('Lock tests');
  [owner, buyer] = await Promise.all([createUser('lock-owner'), createUser('lock-buyer')]);
  await Promise.all([addMember(org, owner.id, 'owner'), addMember(org, buyer.id, 'buyer')]);
}, 60_000);

describe('no lock', () => {
  it('lets a member set whatever they like', async () => {
    await setLock('alert_lead_minutes', 30, 'none');
    const saved = await savePreference(buyer, 'alert_lead_minutes', 5);
    expect(saved.error).toBeNull();
  });

  it('lets a member set a preference the organisation never mentioned', async () => {
    const saved = await savePreference(buyer, 'table_density', '"comfortable"');
    expect(saved.error).toBeNull();
  });
});

describe('a fixed lock', () => {
  beforeAll(async () => {
    await setLock('default_resale_scenario', '"conservative"', 'fixed');
  });

  it('refuses a different value', async () => {
    const saved = await savePreference(buyer, 'default_resale_scenario', '"optimistic"');
    expect(saved.error).not.toBeNull();
    expect(saved.error?.message).toContain('fixed');
  });

  it('accepts the organisation value itself', async () => {
    const saved = await savePreference(buyer, 'default_resale_scenario', '"conservative"');
    expect(saved.error).toBeNull();
  });
});

describe('a floor lock', () => {
  beforeAll(async () => {
    // CS29. Members can raise the target profit but never lower it.
    await setLock('default_target_profit', 4000, 'floor');
  });

  it('refuses a lower value', async () => {
    const saved = await savePreference(buyer, 'default_target_profit', 2500);
    expect(saved.error).not.toBeNull();
    expect(saved.error?.message).toContain('floor');
  });

  it('accepts the floor exactly', async () => {
    const saved = await savePreference(buyer, 'default_target_profit', 4000);
    expect(saved.error).toBeNull();
  });

  it('accepts a higher value, because higher is stricter', async () => {
    const saved = await savePreference(buyer, 'default_target_profit', 6000);
    expect(saved.error).toBeNull();
  });

  it('refuses a value that is not a number', async () => {
    const saved = await savePreference(buyer, 'default_target_profit', '"lots"');
    expect(saved.error).not.toBeNull();
  });
});

describe('the lock applies to the organisation that set it', () => {
  it('leaves another organisation alone', async () => {
    const otherOrg = await createOrganisation('Unlocked');
    const user = await createUser('unlocked');
    await addMember(otherOrg, user.id, 'buyer');

    const saved = await user.client
      .from('user_preferences')
      .upsert({ user_id: user.id, org_id: otherOrg, key: 'default_target_profit', value: 100 });
    expect(saved.error).toBeNull();
  });
});
