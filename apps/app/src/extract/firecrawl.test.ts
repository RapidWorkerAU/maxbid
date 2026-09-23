import { describe, expect, it, vi } from 'vitest';
import { SiteAccessError, USER_AGENT, assertAllowed, robotsFor } from './firecrawl';

function fakeFetch(body: string, ok = true) {
  return vi.fn(async () => ({ ok, text: async () => body })) as unknown as typeof fetch;
}

// Each test uses its own host, because robots.txt is cached per origin.
const host = () => `https://${crypto.randomUUID()}.test`;

describe('identifying ourselves', () => {
  it('says who we are and where to find out more', () => {
    // Rule 2 of site-access.md. Never impersonate a browser.
    expect(USER_AGENT).toContain('MaxBidBot');
    expect(USER_AGENT).toContain('maxbid.com.au');
    expect(USER_AGENT.toLowerCase()).not.toContain('mozilla');
  });

  it('sends that user agent when reading robots.txt', async () => {
    const fetcher = fakeFetch('User-agent: *\nDisallow:');
    await robotsFor(host(), fetcher);
    const [, init] = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(init.headers['User-Agent']).toBe(USER_AGENT);
  });
});

describe('obeying robots.txt', () => {
  it('refuses a disallowed path, with the reason', async () => {
    const origin = host();
    const fetcher = fakeFetch('User-agent: *\nDisallow: /catalogue/');
    await expect(assertAllowed(`${origin}/catalogue/grays`, fetcher)).rejects.toThrow(
      SiteAccessError,
    );
  });

  it('allows a path the rules permit', async () => {
    const origin = host();
    const fetcher = fakeFetch('User-agent: *\nDisallow: /admin');
    await expect(assertAllowed(`${origin}/sale/1`, fetcher)).resolves.toBeUndefined();
  });

  it('reads robots.txt once per host rather than once per page', async () => {
    const origin = host();
    const fetcher = fakeFetch('User-agent: *\nDisallow:');
    await assertAllowed(`${origin}/a`, fetcher);
    await assertAllowed(`${origin}/b`, fetcher);
    expect((fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it('treats an unreadable robots.txt as no rules, not as permission to ignore it', async () => {
    const origin = host();
    const fetcher = fakeFetch('', false);
    const rules = await robotsFor(origin, fetcher);
    expect(rules).toEqual({ allow: [], disallow: [] });
  });
});
