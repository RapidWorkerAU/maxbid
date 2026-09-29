// The evidence a valuation rests on, and who may touch it.
//
// Two rules. A listing is shared, because it is the same listing whoever looks
// at it, but one a user supplied stays theirs. And nobody may write evidence
// by hand: a price a user could write would not be evidence.
//
// Source: docs/02-specs/security-and-rls.md. D09, F62.

import { beforeAll, describe, expect, it } from 'vitest';
import { isEmpty, serviceClient } from './testing/localSupabase';
import { createAuction, createTenants, type AuctionFixture, type Tenants } from './testing/fixtures';

let t: Tenants;
let a: AuctionFixture;
let sharedId: string;
let privateId: string;
let matchId: string;

async function makeComparable(orgId: string | null) {
  const admin = serviceClient();
  const comparable = await admin
    .from('comparables')
    .insert({
      source_type: orgId ? 'user_supplied' : 'advertised_used',
      org_id: orgId,
      provenance: orgId ? 'user_input' : 'extracted',
      source_name: 'Invented Listings',
      url: `https://example.test/${crypto.randomUUID()}`,
      title: 'An invented wagon, 2015',
      year: 2015,
      condition: 'used',
    })
    .select('id')
    .single();
  if (comparable.error) throw comparable.error;

  const snapshot = await admin
    .from('comparable_snapshots')
    .insert({ comparable_id: comparable.data.id, price: 18500, status: 'active' })
    .select('id')
    .single();
  if (snapshot.error) throw snapshot.error;

  return { comparableId: comparable.data.id, snapshotId: snapshot.data.id };
}

beforeAll(async () => {
  t = await createTenants();
  a = await createAuction(t);

  const shared = await makeComparable(null);
  sharedId = shared.comparableId;
  privateId = (await makeComparable(t.orgB)).comparableId;

  const identification = await serviceClient()
    .from('lot_identifications')
    .insert({ analysis_id: a.analysisId, lot_id: a.lotId, stage: 'triage', confidence: 90 })
    .select('id')
    .single();
  if (identification.error) throw identification.error;

  const match = await serviceClient()
    .from('lot_comparables')
    .insert({
      identification_id: identification.data.id,
      comparable_id: shared.comparableId,
      snapshot_id: shared.snapshotId,
      match_level: 'near_exact',
      reason: 'Same year, same model, same fuel, and a similar odometer reading.',
      adjusted_price: 16650,
      weight: 0.72,
    })
    .select('id')
    .single();
  if (match.error) throw match.error;
  matchId = match.data.id;
}, 60_000);

describe('a listing is shared, because it is the same listing for everybody', () => {
  it('shows a shared comparable to both organisations', async () => {
    for (const user of [t.ownerA, t.ownerB]) {
      const seen = await user.client.from('comparables').select('id').eq('id', sharedId);
      expect(isEmpty(seen), 'a shared comparable should be visible').toBe(false);
    }
  });

  it('shows its price to both as well', async () => {
    for (const user of [t.ownerA, t.ownerB]) {
      const seen = await user.client
        .from('comparable_snapshots')
        .select('id')
        .eq('comparable_id', sharedId);
      expect(isEmpty(seen), 'the price should be visible').toBe(false);
    }
  });
});

describe('a comparable a user supplied stays theirs', () => {
  it('shows it to the organisation that supplied it', async () => {
    const seen = await t.ownerB.client.from('comparables').select('id').eq('id', privateId);
    expect(isEmpty(seen), 'the owner should see their own').toBe(false);
  });

  it('hides it from everybody else', async () => {
    const seen = await t.ownerA.client.from('comparables').select('id').eq('id', privateId);
    expect(isEmpty(seen), 'another organisation must not see it').toBe(true);
  });

  it('hides its price too', async () => {
    const seen = await t.ownerA.client
      .from('comparable_snapshots')
      .select('id')
      .eq('comparable_id', privateId);
    expect(isEmpty(seen), 'the price must not leak where the listing does not').toBe(true);
  });
});

describe('nobody writes evidence by hand', () => {
  it('refuses a comparable written by a user', async () => {
    const written = await t.ownerA.client.from('comparables').insert({
      source_type: 'advertised_used',
      provenance: 'extracted',
      source_name: 'Made up',
      title: 'Made up',
    });
    expect(written.error).not.toBeNull();
  });

  it('refuses a price written by a user', async () => {
    const written = await t.ownerA.client
      .from('comparable_snapshots')
      .insert({ comparable_id: sharedId, price: 1, status: 'active' });
    expect(written.error).not.toBeNull();
  });
});

describe('a match belongs to whoever owns the analysis', () => {
  it('shows it to them', async () => {
    const seen = await t.ownerA.client.from('lot_comparables').select('id').eq('id', matchId);
    expect(isEmpty(seen), 'the owner should see the match').toBe(false);
  });

  it('hides it from another organisation', async () => {
    const seen = await t.ownerB.client.from('lot_comparables').select('id').eq('id', matchId);
    expect(isEmpty(seen), 'another organisation must not see it').toBe(true);
  });

  it('lets the owner exclude a comparable with a reason. F62', async () => {
    const excluded = await t.ownerA.client
      .from('lot_comparables')
      .update({ excluded_by_user: true, exclusion_reason: 'This one is a dealer demonstrator.' })
      .eq('id', matchId);
    expect(excluded.error).toBeNull();
  });

  it('refuses an exclusion with no reason', async () => {
    // An excluded comparable with no reason is just a missing number, and
    // nobody could tell later why the figure moved.
    const excluded = await serviceClient()
      .from('lot_comparables')
      .update({ excluded_by_user: true, exclusion_reason: '   ' })
      .eq('id', matchId);
    expect(excluded.error).not.toBeNull();
  });
});
