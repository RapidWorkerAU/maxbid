import { describe, expect, it, vi } from 'vitest';
import { SiteAccessError, USER_AGENT, assertAllowed, robotsFor } from './firecrawl';

function fakeFetch(body: string) {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    text: async () => body,
  })) as unknown as typeof fetch;
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
    const calls = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0][1].headers['User-Agent']).toBe(USER_AGENT);
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
});

describe('when robots.txt cannot be read', () => {
  it('treats a 404 as no rules, because the site publishes none', async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      status: 404,
      text: async () => '',
    })) as unknown as typeof fetch;
    expect(await robotsFor(host(), fetcher)).toEqual({ allow: [], disallow: [] });
  });

  it('refuses to fetch when the connection fails', async () => {
    // Grays resets connections intermittently. A failure to ask is not
    // permission to proceed.
    const fetcher = vi.fn(async () => {
      throw new Error('ECONNRESET');
    }) as unknown as typeof fetch;
    await expect(assertAllowed(`${host()}/sale/1`, fetcher)).rejects.toThrow(SiteAccessError);
  });

  it('refuses to fetch when the site answers anything else', async () => {
    const fetcher = vi.fn(async () => ({
      ok: false,
      status: 403,
      text: async () => '',
    })) as unknown as typeof fetch;
    await expect(assertAllowed(`${host()}/sale/1`, fetcher)).rejects.toThrow(/do not fetch/);
  });
});
