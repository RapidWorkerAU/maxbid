// eBay Browse API. Advertised evidence, per data-sources.md.
//
// The resale range is built from what the public pays, and since decision
// record 0028 that means auction results no longer build it. What is left is
// one web search per lot, which found three or four usable listings and a
// combined weight of around 1.2 against the 1.5 the evidence rule asks for.
// Not one lot on the real catalogue got a range.
//
// eBay is the obvious place to look next. It is an official API with its own
// terms rather than a site we are scraping, data-sources.md puts it at low
// legal risk, and it returns structured prices rather than snippets a model
// has to read.
//
// These are active listings, so they are asking prices and weigh 0.6 like any
// other advertisement. Sold prices need the Marketplace Insights API, which
// needs eBay's approval, which is O04 and has not been applied for.

export type EbayListing = {
  id: string;
  title: string;
  url: string;
  /** In AUD. Listings in other currencies are left out rather than converted. */
  price: number;
  /** As eBay states it: NEW, USED_EXCELLENT and so on. */
  condition: string | null;
  location: string | null;
};

export class EbayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EbayError';
  }
}

const TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const SEARCH_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search';

/** Australian prices are the only ones that help an Australian reseller. */
const MARKETPLACE = 'EBAY_AU';
const CURRENCY = 'AUD';

/**
 * A token lasts two hours and is the same for every call.
 *
 * Kept in the module rather than fetched each time, because a token request
 * per search would double the calls for nothing. Refreshed a minute early, so
 * a token that expires between the check and the request does not fail a
 * search for a reason nobody could reproduce.
 */
let token: { value: string; expiresAt: number } | null = null;

export function forgetToken() {
  token = null;
}

async function accessToken(): Promise<string> {
  if (token && token.expiresAt > Date.now()) return token.value;

  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) throw new EbayError('eBay credentials are not configured.');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'https://api.ebay.com/oauth/api_scope',
    }),
  });

  if (!response.ok) {
    throw new EbayError(`eBay refused the credentials: ${response.status}.`);
  }

  const payload = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!payload.access_token) throw new EbayError('eBay returned no access token.');

  const seconds = typeof payload.expires_in === 'number' ? payload.expires_in : 7200;
  token = { value: payload.access_token, expiresAt: Date.now() + (seconds - 60) * 1000 };
  return token.value;
}

/**
 * Turns eBay's answer into ours, dropping anything unusable.
 *
 * A listing without a price in Australian dollars is left out rather than
 * converted. An exchange rate we applied would be our figure inside what is
 * meant to be somebody else's price, and the rate on the day a listing was
 * seen is not something we keep.
 */
export function readEbayResults(payload: unknown): EbayListing[] {
  const items = (payload as { itemSummaries?: unknown[] })?.itemSummaries;
  if (!Array.isArray(items)) return [];

  const listings: EbayListing[] = [];
  for (const item of items) {
    const row = item as Record<string, unknown>;
    const price = row.price as { value?: string; currency?: string } | undefined;
    const amount = Number(price?.value);

    if (
      typeof row.itemId !== 'string' ||
      typeof row.title !== 'string' ||
      typeof row.itemWebUrl !== 'string' ||
      price?.currency !== CURRENCY ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      continue;
    }

    listings.push({
      id: row.itemId,
      title: row.title,
      url: row.itemWebUrl,
      price: amount,
      condition: typeof row.condition === 'string' ? row.condition : null,
      location:
        typeof (row.itemLocation as { postalCode?: string } | undefined)?.postalCode === 'string'
          ? ((row.itemLocation as { postalCode?: string }).postalCode ?? null)
          : null,
    });
  }
  return listings;
}

/** Live listings for one query, newest and most relevant first. */
export async function searchEbay(query: string, limit = 20): Promise<EbayListing[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  // Used goods only. A new retail price is weighted nought by decision record
  // 0020 and asking for them would spend the call on rows we discard.
  url.searchParams.set('filter', 'conditions:{USED}');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'X-EBAY-C-MARKETPLACE-ID': MARKETPLACE,
    },
  });

  if (!response.ok) {
    throw new EbayError(`eBay search failed: ${response.status}.`);
  }
  return readEbayResults(await response.json());
}
