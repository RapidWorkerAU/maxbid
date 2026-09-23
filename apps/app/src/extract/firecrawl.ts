import Firecrawl from '@mendable/firecrawl-js';
import { isAllowed, parseRobots } from './robots';

// Fetching a catalogue page. Firecrawl, chosen by decision record 0014.
//
// Every rule in docs/02-specs/site-access.md is enforced here rather than
// left for each extractor to remember:
//
// 1. robots.txt is read on every run and obeyed.
// 2. We identify ourselves honestly. We never impersonate a browser to defeat
//    a block that is there on purpose.
// 3. Requests are rate limited per host.
// 4. Public pages only. Nothing here can sign in.

/** Rule 2. An auction house can see who we are and contact us. */
export const USER_AGENT = 'MaxBidBot/1.0 (+https://maxbid.com.au/bot)';

/** Rule 3. One request per host at a time, with a gap between them. */
const MIN_GAP_MS = 1_000;
const lastFetchByHost = new Map<string, number>();
const robotsByHost = new Map<string, { rules: ReturnType<typeof parseRobots>; readAt: number }>();
const ROBOTS_TTL_MS = 60 * 60 * 1000;

export class SiteAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SiteAccessError';
  }
}

async function waitForTurn(host: string): Promise<void> {
  const last = lastFetchByHost.get(host);
  if (last !== undefined) {
    const wait = MIN_GAP_MS - (Date.now() - last);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastFetchByHost.set(host, Date.now());
}

/**
 * Reads robots.txt for a host, cached for an hour rather than for a build.
 *
 * Three outcomes, and the difference matters.
 *
 * A 404 means the site publishes no robots.txt, so there are no rules.
 *
 * A readable file means we obey what it says.
 *
 * Anything else, a connection reset or a 403, means we do not know what the
 * rules are. Grays resets connections intermittently, and treating that as
 * "no rules" would turn a failure to ask into permission to proceed. So this
 * throws, and the caller does not fetch.
 */
export async function robotsFor(origin: string, fetcher = fetch) {
  const cached = robotsByHost.get(origin);
  if (cached && Date.now() - cached.readAt < ROBOTS_TTL_MS) return cached.rules;

  let text: string;
  try {
    const response = await fetcher(`${origin}/robots.txt`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (response.status === 404) text = '';
    else if (response.ok) text = await response.text();
    else {
      throw new SiteAccessError(
        `Could not read robots.txt at ${origin}: the site answered ${response.status}. We do not fetch a page without knowing its rules.`,
      );
    }
  } catch (cause) {
    if (cause instanceof SiteAccessError) throw cause;
    throw new SiteAccessError(
      `Could not reach robots.txt at ${origin}. We do not fetch a page without knowing its rules.`,
    );
  }

  const rules = parseRobots(text, 'maxbidbot');
  robotsByHost.set(origin, { rules, readAt: Date.now() });
  return rules;
}

/** Throws when robots.txt disallows the path. Rule 1. */
export async function assertAllowed(url: string, fetcher = fetch): Promise<void> {
  const parsed = new URL(url);
  const rules = await robotsFor(parsed.origin, fetcher);
  if (!isAllowed(rules, parsed.pathname)) {
    throw new SiteAccessError(
      `robots.txt at ${parsed.origin} does not allow ${parsed.pathname}. We do not fetch it.`,
    );
  }
}

export type FetchedPage = {
  url: string;
  markdown: string;
  html?: string;
  fetchedAt: string;
};

let client: Firecrawl | undefined;

function firecrawl(): Firecrawl {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY is not set. Add it to apps/app/.env.local.');
  }
  client ??= new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
  return client;
}

/**
 * Fetches one public catalogue page.
 *
 * Checks robots.txt, waits its turn, then asks Firecrawl for the rendered
 * page. The payload is returned rather than stored, so the caller decides
 * what to keep in raw_extract.
 */
export async function fetchPage(url: string): Promise<FetchedPage> {
  await assertAllowed(url);
  await waitForTurn(new URL(url).host);

  const result = await firecrawl().scrape(url, {
    formats: ['markdown'],
    onlyMainContent: true,
  });

  const markdown = result?.markdown;
  if (!markdown) {
    throw new SiteAccessError(`Firecrawl returned no content for ${url}.`);
  }

  return { url, markdown, fetchedAt: new Date().toISOString() };
}
