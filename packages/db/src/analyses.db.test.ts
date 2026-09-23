// Analyses are scoped to one organisation.
//
// The auction underneath is shared, so this is the line that matters: what a
// user shortlisted and what it is worth to them is theirs alone. F02.

import { beforeAll, describe, expect, it } from 'vitest';
import { isEmpty } from './testing/localSupabase';
import { createAuction, createTenants, type AuctionFixture, type Tenants } from './testing/fixtures';

let t: Tenants;
let a: AuctionFixture;

beforeAll(async () => {
  t = await createTenants();
  a = await createAuction(t);
}, 60_000);

describe('analyses belong to one organisation', () => {
  it('shows an analysis to its own organisation', async () => {
    const seen = await t.buyerA.client.from('analyses').select('id').eq('id', a.analysisId);
    expect(isEmpty(seen)).toBe(false);
  });

  it('hides it from another organisation', async () => {
    const seen = await t.ownerB.client.from('analyses').select('id').eq('id', a.analysisId);
    expect(isEmpty(seen)).toBe(true);
  });

  it('hides the analysis lots too, through the parent analysis', async () => {
    const seen = await t.ownerB.client
      .from('analysis_lots')
      .select('id')
      .eq('analysis_id', a.analysisId);
    expect(isEmpty(seen)).toBe(true);
  });

  it('shows the analysis lots to the owning organisation', async () => {
    const seen = await t.buyerA.client.from('analysis_lots').select('opportunity_score');
    expect(seen.data?.[0]?.opportunity_score).toBe(74);
  });

  it('refuses an analysis created for another organisation', async () => {
    const written = await t.ownerB.client.from('analyses').insert({
      org_id: t.orgA,
      auction_id: a.auctionId,
      created_by: t.ownerB.id,
      source_type: 'url',
    });
    expect(written.error).not.toBeNull();
  });

  it('refuses an analysis attributed to somebody else', async () => {
    const written = await t.buyerA.client.from('analyses').insert({
      org_id: t.orgA,
      auction_id: a.auctionId,
      created_by: t.ownerA.id,
      source_type: 'url',
    });
    expect(written.error).not.toBeNull();
  });
});

describe('roles apply to analyses', () => {
  it('lets a buyer create one', async () => {
    const written = await t.buyerA.client
      .from('analyses')
      .insert({
        org_id: t.orgA,
        auction_id: a.auctionId,
        created_by: t.buyerA.id,
        source_type: 'url',
      })
      .select('id');
    expect(written.error).toBeNull();
  });

  it('stops a viewer creating one', async () => {
    const written = await t.viewerA.client.from('analyses').insert({
      org_id: t.orgA,
      auction_id: a.auctionId,
      created_by: t.viewerA.id,
      source_type: 'url',
    });
    expect(written.error).not.toBeNull();
  });

  it('lets a viewer read them', async () => {
    expect(isEmpty(await t.viewerA.client.from('analyses').select('id'))).toBe(false);
  });

  it('stops a viewer shortlisting a lot', async () => {
    const written = await t.viewerA.client
      .from('analysis_lots')
      .update({ status: 'shortlisted' })
      .eq('analysis_id', a.analysisId)
      .select('id');
    expect(isEmpty(written)).toBe(true);
  });

  it('lets a buyer shortlist a lot', async () => {
    const written = await t.buyerA.client
      .from('analysis_lots')
      .update({ status: 'shortlisted' })
      .eq('analysis_id', a.analysisId)
      .select('id');
    expect(written.error).toBeNull();
    expect(isEmpty(written)).toBe(false);
  });
});
