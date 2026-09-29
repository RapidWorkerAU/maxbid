import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FETCHES_PER_MINUTE, forgetEveryTurn, takeATurn, turnsLeft } from './rateLimit';

beforeEach(() => {
  vi.useFakeTimers();
  forgetEveryTurn();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('staying inside what the service allows', () => {
  it('lets a minute of fetches through without waiting', async () => {
    for (let i = 0; i < FETCHES_PER_MINUTE; i += 1) await takeATurn();
    expect(turnsLeft()).toBe(0);
  });

  it('makes the next one wait rather than fail', async () => {
    // The first harvest of a real sale read 18 lots of 36 and then failed on
    // every one after, all with "Rate limit exceeded". A refused request is a
    // wasted one, and the point of a queue is not to make it.
    for (let i = 0; i < FETCHES_PER_MINUTE; i += 1) await takeATurn();

    let allowed = false;
    const waiting = takeATurn().then(() => {
      allowed = true;
    });

    await vi.advanceTimersByTimeAsync(1_000);
    expect(allowed, 'it should still be waiting').toBe(false);

    await vi.advanceTimersByTimeAsync(60_000);
    await waiting;
    expect(allowed).toBe(true);
  });

  it('forgets a fetch once its minute has passed', async () => {
    await takeATurn();
    expect(turnsLeft()).toBe(FETCHES_PER_MINUTE - 1);
    vi.advanceTimersByTime(61_000);
    expect(turnsLeft()).toBe(FETCHES_PER_MINUTE);
  });

  it('is set below what the service allows', () => {
    // The free plan refused from the eleventh request in a minute onward.
    expect(FETCHES_PER_MINUTE).toBeLessThan(10);
  });
});

describe('every caller shares one allowance', () => {
  it('counts fetches from different callers together', async () => {
    // Harvesting and valuing at once would otherwise each believe they had
    // the whole allowance, and between them use twice it.
    await Promise.all(
      Array.from({ length: FETCHES_PER_MINUTE }, () => takeATurn()),
    );
    expect(turnsLeft()).toBe(0);
  });

  it('lets them through one at a time rather than all at once', async () => {
    const order: number[] = [];
    const waits = Array.from({ length: FETCHES_PER_MINUTE }, (_, index) =>
      takeATurn().then(() => order.push(index)),
    );
    await Promise.all(waits);
    // The queue is what stops two callers both thinking they are next.
    expect(order).toEqual(order.slice().sort((a, b) => a - b));
  });
});
