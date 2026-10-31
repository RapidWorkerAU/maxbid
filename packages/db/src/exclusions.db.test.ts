// Setting a comparable aside, and who may do it. F62.
//
// This is the one judgement in the evidence trail that belongs to the user
// rather than to the pipeline, so unlike every other evidence table they may
// write it. What the policies have to hold is that the judgement stays inside
// the organisation that made it, that it always says truthfully who made it,
// and that the reason cannot be rewritten afterwards.
//
// Source: docs/02-specs/security-and-rls.md. F62.

import { beforeAll, describe, expect, it } from 'vitest';
import { isEmpty, serviceClient } from './testing/localSupabase';
import {
  createAuction,
  createTenants,
  type AuctionFixture,
  type Tenants,
} from './testing/fixtures';

let t: Tenants;
let a: AuctionFixture;
let identificationId: string;
let matchId: string;

/**
 * One graded comparable against the fixture lot's identification.
 *
 * The identification is made once, in the setup, because a lot may have only
 * one current identification per analysis. Each call here adds another
 * comparable to that same identification, which is what a lot with several
 * pieces of evidence actually looks like.
 */
async function makeEvidence(): Promise<string> {
  const admin = serviceClient();

  const comparable = await admin
    .from('comparables')
    .insert({
      source_type: 'advertised_used',
      provenance: 'extracted',
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

  const match = await admin
    .from('lot_comparables')
    .insert({
      identification_id: identificationId,
      comparable_id: comparable.data.id,
      snapshot_id: snapshot.data.id,
      match_level: 'near_exact',
      reason: 'Same year, same model, same fuel, and a similar odometer reading.',
      adjusted_price: 16650,
      weight: 0.72,
    })
    .select('id')
    .single();
  if (match.error) throw match.error;
  return match.data.id as string;
}

/** Sets one aside as the given user, and reports whether it was allowed. */
async function exclude(
  user: { id: string; client: Tenants['ownerA']['client'] },
  comparableId: string,
  reason = 'This is a different model, not the one in this lot.',
) {
  return await user.client.from('comparable_exclusions').insert({
    analysis_id: a.analysisId,
    lot_comparable_id: comparableId,
    reason,
    excluded_by: user.id,
  });
}

beforeAll(async () => {
  t = await createTenants();
  a = await createAuction(t);

  const identification = await serviceClient()
    .from('lot_identifications')
    .insert({ analysis_id: a.analysisId, lot_id: a.lotId, stage: 'triage', confidence: 90 })
    .select('id')
    .single();
  if (identification.error) throw identification.error;
  identificationId = identification.data.id as string;

  matchId = await makeEvidence();
}, 60_000);

describe('the organisation that found the evidence judges it', () => {
  it('lets a buyer set a comparable aside with a reason', async () => {
    const written = await exclude(t.buyerA, matchId);
    expect(written.error, 'a buyer should be able to set one aside').toBeNull();
  });

  it('shows that exclusion to the rest of the organisation', async () => {
    const seen = await t.ownerA.client
      .from('comparable_exclusions')
      .select('reason')
      .eq('analysis_id', a.analysisId);
    expect(isEmpty(seen), 'the owner should read what the buyer set aside').toBe(false);
  });

  it('hides it from another organisation', async () => {
    const seen = await t.ownerB.client
      .from('comparable_exclusions')
      .select('reason')
      .eq('analysis_id', a.analysisId);
    // One organisation deciding a listing is not the same thing does not make
    // it so for everybody, so their judgement is not even visible elsewhere.
    expect(isEmpty(seen), 'another organisation should see nothing').toBe(true);
  });

  it('refuses the same comparable twice, so a count cannot double', async () => {
    const again = await exclude(t.ownerA, matchId);
    expect(again.error, 'a second exclusion of the same one should be refused').not.toBeNull();
  });
});

describe('who may not set one aside', () => {
  it('refuses a viewer, who may read the analysis but not change it', async () => {
    const other = await makeEvidence();
    const written = await exclude(t.viewerA, other);
    expect(written.error, 'a viewer should not change the figures').not.toBeNull();
  });

  it('refuses another organisation entirely', async () => {
    const other = await makeEvidence();
    const written = await exclude(t.ownerB, other);
    expect(written.error, "nobody edits another organisation's analysis").not.toBeNull();
  });

  it('refuses an exclusion recorded against somebody else', async () => {
    // An exclusion that names the wrong person is worse than none: the trail
    // would say a colleague made a judgement they never made.
    const other = await makeEvidence();
    const written = await t.ownerA.client.from('comparable_exclusions').insert({
      analysis_id: a.analysisId,
      lot_comparable_id: other,
      reason: 'This is a different model, not the one in this lot.',
      excluded_by: t.buyerA.id,
    });
    expect(written.error, 'somebody may only record themselves').not.toBeNull();
  });

  it('refuses a blank reason', async () => {
    const other = await makeEvidence();
    const written = await exclude(t.ownerA, other, '   ');
    expect(written.error, 'an exclusion with no reason explains nothing').not.toBeNull();
  });
});

describe('the reason is the record of why a figure moved', () => {
  it('cannot be rewritten afterwards', async () => {
    const changed = await t.ownerA.client
      .from('comparable_exclusions')
      .update({ reason: 'Something else entirely.' })
      .eq('analysis_id', a.analysisId)
      .eq('lot_comparable_id', matchId)
      .select('id');
    // There is no update policy, so this matches nothing rather than failing.
    expect(isEmpty(changed), 'no update should be possible').toBe(true);
  });

  it('goes when they put the comparable back, which is a delete', async () => {
    const removed = await t.ownerA.client
      .from('comparable_exclusions')
      .delete()
      .eq('analysis_id', a.analysisId)
      .eq('lot_comparable_id', matchId)
      .select('id');
    expect(isEmpty(removed), 'putting one back should remove the exclusion').toBe(false);
  });
});
