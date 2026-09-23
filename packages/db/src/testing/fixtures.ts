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

export type AuctionFixture = {
  auctionId: string;
  lotId: string;
  analysisId: string;
};

/** A shared auction with one lot, plus an analysis of it owned by orgA. */
export async function createAuction(tenants: Tenants): Promise<AuctionFixture> {
  const admin = serviceClient();

  const platform = await admin
    .from('auction_platforms')
    .insert({ slug: `grays-${crypto.randomUUID()}`, name: 'Grays', extractor_version: '0.1.0' })
    .select('id')
    .single();
  if (platform.error) throw platform.error;

  const auction = await admin
    .from('auctions')
    .insert({
      platform_id: platform.data.id,
      source_url: `https://example.test/${crypto.randomUUID()}`,
      title: 'Woodworking machinery, Perth',
      premium_source: 'extracted',
      premium_pct: 0.165,
    })
    .select('id')
    .single();
  if (auction.error) throw auction.error;

  const lot = await admin
    .from('lots')
    .insert({ auction_id: auction.data.id, lot_number: 'LOT-001', title: 'Edgebander' })
    .select('id')
    .single();
  if (lot.error) throw lot.error;

  const analysis = await admin
    .from('analyses')
    .insert({
      org_id: tenants.orgA,
      auction_id: auction.data.id,
      created_by: tenants.ownerA.id,
      source_type: 'url',
    })
    .select('id')
    .single();
  if (analysis.error) throw analysis.error;

  const analysisLot = await admin
    .from('analysis_lots')
    .insert({ analysis_id: analysis.data.id, lot_id: lot.data.id, opportunity_score: 74 });
  if (analysisLot.error) throw analysisLot.error;

  return { auctionId: auction.data.id, lotId: lot.data.id, analysisId: analysis.data.id };
}
