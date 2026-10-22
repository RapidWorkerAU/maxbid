// What a lot is and what it is worth, shared across organisations.
// Decision record 0024.
//
// Two things are proved here. A resale value is the same whoever is buying,
// so everybody reads the same one and nobody writes it. And an identification
// has two kinds: the baseline everybody reads, and one organisation's own
// correction, which stays theirs.

import { beforeAll, describe, expect, it } from 'vitest';
import { isEmpty, serviceClient } from './testing/localSupabase';
import { createAuction, createTenants, type AuctionFixture, type Tenants } from './testing/fixtures';

let t: Tenants;
let a: AuctionFixture;

const valuation = {
  conservative: 8500,
  expected: 15300,
  optimistic: 22500,
  confidence: 62,
  comparable_count: 5,
  combined_weight: 1.54,
  method_version: 'triage-1.0.0',
};

beforeAll(async () => {
  t = await createTenants();
  a = await createAuction(t);

  const written = await serviceClient()
    .from('triage_valuations')
    .insert({ lot_id: a.lotId, ...valuation });
  if (written.error) throw written.error;

  // The baseline a nightly crawl would write: no analysis behind it.
  const shared = await serviceClient().from('lot_identifications').insert({
    lot_id: a.lotId,
    analysis_id: null,
    stage: 'triage',
    brand: 'Invented',
    model: 'Cruiser Gamma',
    year: 2008,
    confidence: 90,
  });
  if (shared.error) throw shared.error;
}, 60_000);

describe('a resale value is the same whoever is buying', () => {
  it('shows the same valuation to both organisations', async () => {
    for (const user of [t.ownerA, t.ownerB]) {
      const seen = await user.client
        .from('triage_valuations')
        .select('conservative')
        .eq('lot_id', a.lotId);
      expect(isEmpty(seen), 'both should read the same valuation').toBe(false);
    }
  });

  it('lets nobody write one', async () => {
    // A valuation a user could write would not be a valuation.
    const written = await t.ownerA.client
      .from('triage_valuations')
      .insert({ lot_id: a.lotId, ...valuation, method_version: 'made-up' });
    expect(written.error).not.toBeNull();
  });

  it('lets nobody change one', async () => {
    const changed = await t.ownerA.client
      .from('triage_valuations')
      .update({ conservative: 1 })
      .eq('lot_id', a.lotId);
    const after = await serviceClient()
      .from('triage_valuations')
      .select('conservative')
      .eq('lot_id', a.lotId)
      .eq('is_current', true)
      .single();
    expect(changed.error !== null || Number(after.data?.conservative) === 8500).toBe(true);
  });
});

describe('what a valuation refuses to hold', () => {
  it('refuses a range that does not run upwards', async () => {
    const written = await serviceClient().from('triage_valuations').insert({
      lot_id: a.lotId,
      ...valuation,
      conservative: 30000,
      is_current: false,
    });
    expect(written.error).not.toBeNull();
  });

  it('refuses a second current valuation for the same lot', async () => {
    // A re-valuation supersedes the one before it rather than sitting beside
    // it, so two current figures cannot disagree.
    const written = await serviceClient()
      .from('triage_valuations')
      .insert({ lot_id: a.lotId, ...valuation });
    expect(written.error).not.toBeNull();
  });

  it('keeps a superseded one, so an older figure can still be explained', async () => {
    const written = await serviceClient()
      .from('triage_valuations')
      .insert({ lot_id: a.lotId, ...valuation, is_current: false });
    expect(written.error).toBeNull();
  });

  it('refuses a confidence outside nought to a hundred', async () => {
    const written = await serviceClient()
      .from('triage_valuations')
      .insert({ lot_id: a.lotId, ...valuation, confidence: 140, is_current: false });
    expect(written.error).not.toBeNull();
  });
});

describe('an identification has a baseline and a correction', () => {
  it('shows the shared baseline to every organisation', async () => {
    for (const user of [t.ownerA, t.ownerB]) {
      const seen = await user.client
        .from('lot_identifications')
        .select('brand')
        .eq('lot_id', a.lotId)
        .is('analysis_id', null);
      expect(isEmpty(seen), 'the baseline is what everybody reads').toBe(false);
    }
  });

  it('lets nobody write the baseline', async () => {
    // It is what every other organisation reads, so one of them changing it
    // would change what everybody else sees.
    const written = await t.ownerA.client.from('lot_identifications').insert({
      lot_id: a.lotId,
      analysis_id: null,
      stage: 'user',
      confidence: 100,
      confirmed_by: t.ownerA.id,
    });
    expect(written.error).not.toBeNull();
  });

  it('lets an organisation correct it for themselves', async () => {
    const written = await t.ownerA.client.from('lot_identifications').insert({
      analysis_id: a.analysisId,
      lot_id: a.lotId,
      stage: 'user',
      brand: 'Something else',
      confidence: 100,
      confirmed_by: t.ownerA.id,
    });
    expect(written.error).toBeNull();
  });

  it('keeps that correction to themselves', async () => {
    const seen = await t.ownerB.client
      .from('lot_identifications')
      .select('brand')
      .eq('analysis_id', a.analysisId);
    expect(isEmpty(seen), 'another organisation must not see it').toBe(true);
  });

  it('allows a baseline and a correction to be current at once', async () => {
    // They are different answers to different questions: what the lot is, and
    // what this organisation says it is.
    const { data } = await serviceClient()
      .from('lot_identifications')
      .select('analysis_id')
      .eq('lot_id', a.lotId)
      .eq('is_current', true);
    expect((data ?? []).length).toBe(2);
  });
});

describe('a record that we tried and could not', () => {
  // O19. A lot that fails the evidence rule stores no range, so without this
  // every analysis paid the search, the model call and the fetches again.

  it('shows the attempt to every organisation', async () => {
    const written = await serviceClient().from('valuation_attempts').insert({
      lot_id: a.lotId,
      method_version: 'triage-valuation-1',
      comparable_count: 1,
      combined_weight: 0.6,
    });
    expect(written.error).toBeNull();

    for (const user of [t.ownerA, t.ownerB]) {
      const seen = await user.client
        .from('valuation_attempts')
        .select('comparable_count')
        .eq('lot_id', a.lotId);
      expect(isEmpty(seen), 'that we looked and found too little is part of the working').toBe(
        false,
      );
    }
  });

  it('lets nobody record one', async () => {
    // A user saying we tried would not make it true.
    const written = await t.ownerA.client.from('valuation_attempts').insert({
      lot_id: a.lotId,
      method_version: 'made-up',
    });
    expect(written.error).not.toBeNull();
  });

  it('lets nobody erase one', async () => {
    // Erasing it would remove the reason their figures are blank.
    const removed = await t.ownerA.client
      .from('valuation_attempts')
      .delete()
      .eq('lot_id', a.lotId);
    const after = await serviceClient()
      .from('valuation_attempts')
      .select('id')
      .eq('lot_id', a.lotId);
    expect(removed.error !== null || !isEmpty(after)).toBe(true);
  });

  it('keeps one attempt per lot per method, so a retry replaces it', async () => {
    const again = await serviceClient().from('valuation_attempts').insert({
      lot_id: a.lotId,
      method_version: 'triage-valuation-1',
    });
    expect(again.error).not.toBeNull();
  });

  it('lets a different method try the same lot', async () => {
    // Improving the method is a reason to look again, so its attempt is its
    // own rather than clashing with the old one.
    const other = await serviceClient().from('valuation_attempts').insert({
      lot_id: a.lotId,
      method_version: 'triage-valuation-2',
    });
    expect(other.error).toBeNull();
  });
});
