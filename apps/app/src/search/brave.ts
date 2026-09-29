// Web search. Brave, chosen by decision record 0018, which closes O03.
//
// Behind an interface of our own, so that swapping the provider is a day
// rather than a rewrite. That matters because the choice was a bet: SerpAPI
// returns Google results and Google's coverage of Australian listing sites is
// probably better, and the only way to find out whether that matters is to
// measure how often a search comes back with nothing usable.

/** One result, in our words rather than the provider's shape. */
export type SearchResult = {
  title: string;
  url: string;
  /** The snippet, with the provider's own markup taken out. */
  snippet: string;
  host: string;
};

export type SearchOptions = {
  /** How many results to ask for. More costs the same and reads the same. */
  count?: number;
  /** The market to search. Australian prices are the only ones that help. */
  country?: string;
};

export interface SearchProvider {
  readonly name: string;
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}

export class SearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchError';
  }
}

/** Brave returns snippets with its own emphasis markup in them. */
export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Turns Brave's answer into ours, dropping anything unusable. */
export function readBraveResults(payload: unknown): SearchResult[] {
  const results = (payload as { web?: { results?: unknown[] } })?.web?.results;
  if (!Array.isArray(results)) return [];

  const out: SearchResult[] = [];
  for (const item of results) {
    const row = item as Record<string, unknown>;
    const url = typeof row.url === 'string' ? row.url : null;
    const title = typeof row.title === 'string' ? row.title : null;
    if (!url || !title) continue;

    let host: string;
    try {
      host = new URL(url).hostname;
    } catch {
      continue;
    }

    out.push({
      title: plainText(title),
      url,
      snippet: plainText(typeof row.description === 'string' ? row.description : ''),
      host,
    });
  }
  return out;
}

export const brave: SearchProvider = {
  name: 'brave',
  async search(query, options = {}) {
    const key = process.env.BRAVE_SEARCH_API_KEY;
    if (!key) {
      throw new SearchError('BRAVE_SEARCH_API_KEY is not set. Add it to apps/app/.env.local.');
    }

    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('country', options.country ?? 'AU');
    url.searchParams.set('count', String(options.count ?? 10));

    const response = await fetch(url, {
      headers: { 'X-Subscription-Token': key, Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new SearchError(`Brave answered ${response.status} for that search.`);
    }

    return readBraveResults(await response.json());
  },
};
