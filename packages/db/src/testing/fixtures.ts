// Two organisations and four users, shared by the row level security tests.

import { addMember, createOrganisation, createUser, serviceClient, type TestUser } from './localSupabase';

export type Tenants = {
  orgA: string;
  orgB: string;
  ownerA: TestUser;
  buyerA: TestUser;
  viewerA: TestUser;
  ownerB: TestUser;
  /** A cost profile belonging to organisation A. */
  profileA: string;
};

export async function createTenants(): Promise<Tenants> {
  const [orgA, orgB] = await Promise.all([
    createOrganisation('Organisation A'),
    createOrganisation('Organisation B'),
  ]);

  const [ownerA, buyerA, viewerA, ownerB] = await Promise.all([
    createUser('owner-a'),
    createUser('buyer-a'),
    createUser('viewer-a'),
    createUser('owner-b'),
  ]);

  await Promise.all([
    addMember(orgA, ownerA.id, 'owner'),
    addMember(orgA, buyerA.id, 'buyer'),
    addMember(orgA, viewerA.id, 'viewer'),
    addMember(orgB, ownerB.id, 'owner'),
  ]);

  const { data, error } = await serviceClient()
    .from('cost_profiles')
    .insert({ org_id: orgA, name: 'Machinery', is_default: true })
    .select('id')
    .single();
  if (error) throw error;

  return { orgA, orgB, ownerA, buyerA, viewerA, ownerB, profileA: data.id as string };
}
