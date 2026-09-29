// The database refuses a premium schedule it cannot read.
//
// The schedule decides what a user is advised to bid, so a malformed one must
// not reach a row and wait to be found by the calculator. Decision record
// 0015. These mirror assertValidSchedule in packages/calc, at the other end.

import { beforeAll, describe, expect, it } from 'vitest';
import { serviceClient } from './testing/localSupabase';
import { createAuction, createTenants, type AuctionFixture, type Tenants } from './testing/fixtures';

let t: Tenants;
let a: AuctionFixture;

beforeAll(async () => {
  t = await createTenants();
  a = await createAuction(t);
}, 60_000);

/** Tries to store a schedule on the fixture auction, and says whether it stuck. */
async function store(schedule: unknown) {
  return serviceClient()
    .from('auctions')
    .update({ premium_schedule: schedule as never })
    .eq('id', a.auctionId);
}

describe('a schedule the database accepts', () => {
  it('takes the real Grays vehicle schedule', async () => {
    const { error } = await store({
      bands: [
        { upTo: 2000, kind: 'fixed', amount: 495 },
        { upTo: 5000, kind: 'fixed', amount: 650 },
        { upTo: 10000, kind: 'fixed', amount: 710 },
        { upTo: 30000, kind: 'rate', rate: 0.07 },
        { upTo: 40000, kind: 'rate', rate: 0.06 },
        { upTo: null, kind: 'rate', rate: 0.05 },
      ],
    });
    expect(error).toBeNull();
  });

  it('takes a single rate, which is one band', async () => {
    const { error } = await store({ bands: [{ upTo: null, kind: 'rate', rate: 0.165 }] });
    expect(error).toBeNull();
  });

  it('takes null, meaning the premium has not been read yet', async () => {
    const { error } = await store(null);
    expect(error).toBeNull();
  });
});

describe('a schedule the database refuses', () => {
  it.each([
    ['no bands at all', { bands: [] }],
    ['not an object', [1, 2, 3]],
    ['bands that are not an array', { bands: 'all of them' }],
    [
      'a last band that stops at a price, leaving dearer lots with no premium',
      { bands: [{ upTo: 2000, kind: 'fixed', amount: 495 }] },
    ],
    [
      'bands that do not rise',
      {
        bands: [
          { upTo: 5000, kind: 'fixed', amount: 650 },
          { upTo: 2000, kind: 'fixed', amount: 495 },
          { upTo: null, kind: 'rate', rate: 0.05 },
        ],
      },
    ],
    ['a kind we do not know', { bands: [{ upTo: null, kind: 'percentage', rate: 0.05 }] }],
    [
      'a fixed band carrying a rate instead of an amount',
      { bands: [{ upTo: null, kind: 'fixed', rate: 0.05 }] },
    ],
    ['an amount below zero', { bands: [{ upTo: null, kind: 'rate', rate: -0.05 }] }],
    ['an amount written as text', { bands: [{ upTo: null, kind: 'fixed', amount: '495' }] }],
    // A missing key is not the same as a wrong one. jsonb_typeof of an absent
    // key is null, and a null condition in plpgsql reads as false, so these
    // three went straight through the first version of the guard.
    ['a band with no kind', { bands: [{ upTo: null, amount: 495 }] }],
    ['a fixed band with no amount', { bands: [{ upTo: null, kind: 'fixed' }] }],
    [
      'a middle band with no upper limit',
      {
        bands: [
          { kind: 'fixed', amount: 495 },
          { upTo: null, kind: 'rate', rate: 0.05 },
        ],
      },
    ],
  ])('refuses %s', async (_name, schedule) => {
    const { error } = await store(schedule);
    expect(error, 'the database should have refused this schedule').not.toBeNull();
  });
});
