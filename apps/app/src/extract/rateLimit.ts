// Keeping inside Firecrawl's own rate limit.
//
// The site access rules already put a second between requests to the same
// host, which is about being a good guest. This is a different thing: the
// extraction service itself caps how many pages it will fetch per minute,
// across every host, and going over it does not slow us down, it fails.
//
// The first harvest of a real sale read 18 lots of 36 and then failed on the
// other 18, all with "Rate limit exceeded". Waiting a second between hosts
// allows sixty requests a minute, and the service allows a good deal fewer.

/**
 * How many page fetches a minute.
 *
 * The free plan reported failures from the eleventh request onward, so ten is
 * what it allows. Set below that, because a request refused is a request
 * wasted and the whole point of a queue is not to make them.
 */
export const FETCHES_PER_MINUTE = 8;

const WINDOW_MS = 60_000;

/** When each recent fetch started, oldest first. */
let recent: number[] = [];

/** Chains the waits, so two callers cannot both think they are next. */
let queue: Promise<void> = Promise.resolve();

function forget(now: number) {
  recent = recent.filter((at) => now - at < WINDOW_MS);
}

/**
 * Waits until another fetch is allowed, then records it.
 *
 * Every caller joins one queue rather than each keeping its own count, since
 * the limit belongs to the service and not to any one stage. Harvesting and
 * valuing at the same time would otherwise each believe they had the whole
 * allowance.
 */
export function takeATurn(): Promise<void> {
  queue = queue.then(async () => {
    forget(Date.now());
    if (recent.length < FETCHES_PER_MINUTE) {
      recent.push(Date.now());
      return;
    }

    // Wait until the oldest fetch in the window falls out of it.
    const oldest = recent[0]!;
    const wait = WINDOW_MS - (Date.now() - oldest) + 50;
    await new Promise((resolve) => setTimeout(resolve, Math.max(wait, 0)));
    forget(Date.now());
    recent.push(Date.now());
  });
  return queue;
}

/** For tests, which must not inherit a window from the test before. */
export function forgetEveryTurn() {
  recent = [];
  queue = Promise.resolve();
}

/** How many fetches are left in this minute, for a message or a test. */
export function turnsLeft(now: number = Date.now()): number {
  forget(now);
  return Math.max(0, FETCHES_PER_MINUTE - recent.length);
}
