// What triage writes, and who may read it.
//
// Two things are guarded here. Spend is private to the organisation that
// incurred it, and a user may correct an identification without being able to
// forge one. Source: docs/02-specs/security-and-rls.md. F13.

import { beforeAll, describe, expect, it } from 'vitest';
import { isEmpty, serviceClient } from './testing/localSupabase';
import { createAuction, createTenants, type AuctionFixture, type Tenants } from './testing/fixtures';

let t: Tenants;
let a: AuctionFixture;
let runIdA: string;

beforeAll(async () => {
  t = await createTenants();
  a = await createAuction(t);

  const run = await serviceClient()
    .from('ai_runs')
    .insert({
      org_id: t.orgA,
      analysis_id: a.analysisId,
      lot_id: a.lotId,
      stage: 'S4',
      model: 'claude-haiku-4-5-20251001',
      prompt_version: 'triage-identify-1',
      input_tokens: 400,
      output_tokens: 120,
      cost_usd: 0.0009,
    })
    .select('id')
    .single();
  if (run.error) throw run.error;
  runIdA = run.data.id;

  const identified = await serviceClient().from('lot_identifications').insert({
    analysis_id: a.analysisId,
    lot_id: a.lotId,
    stage: 'triage',
    brand: 'Invented',
    model: 'Edgebander 200',
    year: 2015,
    confidence: 82,
    ai_run_id: runIdA,
  });
  if (identified.error) throw identified.error;
}, 60_000);

describe('what an organisation was charged is its own business', () => {
  it('shows an organisation its own AI runs', async () => {
    const seen = await t.ownerA.client.from('ai_runs').select('id').eq('id', runIdA);
    expect(isEmpty(seen), 'the owner should see their own run').toBe(false);
  });

  it('hides them from another organisation', async () => {
    const seen = await t.ownerB.client.from('ai_runs').select('id').eq('id', runIdA);
    expect(isEmpty(seen), 'another organisation must not see this spend').toBe(true);
  });

  it('lets nobody write a cost record', async () => {
    // A cost a user could write would not be a cost record at all.
    const written = await t.ownerA.client
      .from('ai_runs')
      .insert({ org_id: t.orgA, stage: 'S4', model: 'x', prompt_version: 'y' });
    expect(written.error).not.toBeNull();
  });

  it('lets nobody change one either', async () => {
    const changed = await t.ownerA.client.from('ai_runs').update({ cost_usd: 0 }).eq('id', runIdA);
    const after = await serviceClient().from('ai_runs').select('cost_usd').eq('id', runIdA).single();
    expect(changed.error !== null || Number(after.data?.cost_usd) === 0.0009).toBe(true);
  });
});

describe('identifications follow their analysis', () => {
  it('shows an identification to the organisation that owns the analysis', async () => {
    const seen = await t.ownerA.client
      .from('lot_identifications')
      .select('id')
      .eq('analysis_id', a.analysisId);
    expect(isEmpty(seen), 'the owner should see it').toBe(false);
  });

  it('hides it from another organisation', async () => {
    const seen = await t.ownerB.client
      .from('lot_identifications')
      .select('id')
      .eq('analysis_id', a.analysisId);
    expect(isEmpty(seen), 'another organisation must not see it').toBe(true);
  });

  it('refuses an identification for an analysis that is not yours', async () => {
    const written = await t.ownerB.client.from('lot_identifications').insert({
      analysis_id: a.analysisId,
      lot_id: a.lotId,
      stage: 'user',
      confidence: 100,
      confirmed_by: t.ownerB.id,
    });
    expect(written.error).not.toBeNull();
  });

  it('refuses a user pretending their correction came from triage', async () => {
    // Only the background jobs produce a triage answer. A user correction that
    // claimed to be one would look like evidence rather than an opinion.
    const written = await t.ownerA.client.from('lot_identifications').insert({
      analysis_id: a.analysisId,
      lot_id: a.lotId,
      stage: 'triage',
      confidence: 100,
      confirmed_by: t.ownerA.id,
    });
    expect(written.error).not.toBeNull();
  });

  it('refuses a correction attributed to somebody else', async () => {
    const written = await t.ownerA.client.from('lot_identifications').insert({
      analysis_id: a.analysisId,
      lot_id: a.lotId,
      stage: 'user',
      confidence: 100,
      confirmed_by: t.ownerB.id,
    });
    expect(written.error).not.toBeNull();
  });
});

describe('only one identification counts at a time', () => {
  it('refuses a second current identification for the same lot', async () => {
    // A second pass supersedes the first rather than sitting beside it.
    const written = await serviceClient().from('lot_identifications').insert({
      analysis_id: a.analysisId,
      lot_id: a.lotId,
      stage: 'deep',
      confidence: 95,
    });
    expect(written.error, 'two current identifications must not coexist').not.toBeNull();
  });

  it('allows a superseded one to sit alongside', async () => {
    const written = await serviceClient().from('lot_identifications').insert({
      analysis_id: a.analysisId,
      lot_id: a.lotId,
      stage: 'deep',
      confidence: 95,
      is_current: false,
    });
    expect(written.error).toBeNull();
  });

  it('refuses a confidence outside nought to a hundred', async () => {
    const written = await serviceClient().from('lot_identifications').insert({
      analysis_id: a.analysisId,
      lot_id: a.lotId,
      stage: 'deep',
      confidence: 140,
      is_current: false,
    });
    expect(written.error).not.toBeNull();
  });
});
