// Finding what a lot like this one has sold for before. Decision record 0020.
//
// Searching the auction house's own site for past lots, then reading each
// result off its page. Demand driven: only the items somebody is actually
// looking at get searched for, rather than harvesting whole sales on the
// chance that one of their lots is wanted later.
//
// A result is public information about a completed sale, so it is stored once
// and every organisation and every later analysis reads the same row. The
// first analysis that needs it pays for the fetch and nobody after does.

import { fetchPage } from '../extract/firecrawl';
import { ageInDays, parseGraysResult, type GraysResult } from '../extract/graysResult';
import { brave, type SearchResult } from '../search/brave';
import { fromOurArchive } from '../search/ourArchive';
import { queryFor, type QuerySubject } from '../search/query';

/** Where past results can be looked for, and how a lot page is recognised. */
export const RESULT_SITES = [
  { host: 'grays.com', name: 'Grays', lotPath: /\/lot\// },
  { host: 'lloydsauctions.com.au', name: 'Lloyds', lotPath: /\/lot\// },
] as const;

/**
 * How many past lots to read for one item.
 *
 * Each is a page fetch. Three sold results clear the evidence threshold on
 * their own, so this is a little above what is needed rather than as many as
 * can be found.
 */
export const MOST_RESULTS_PER_LOT = 5;

export type AuctionResult = GraysResult & {
  url: string;
  title: string;
  sourceName: string;
  /** Days since it closed, which drives the recency weight. */
  ageInDays: number;
};

/** The search that finds past lots of the same thing, on one auction site. */
export function resultQueryFor(subject: QuerySubject, host: string): string | null {
  const base = queryFor(subject);
  if (!base) return null;
  // The words "for sale australia" pull retail listings, which is the wrong
  // market here. A site search wants the item and nothing else.
  return `site:${host} ${base.replace(/ for sale australia$/, '')}`;
}

/** The results that look like a lot page on the site we searched. */
export function lotPagesAmong(results: SearchResult[], lotPath: RegExp): SearchResult[] {
  return results.filter((result) => lotPath.test(new URL(result.url).pathname));
}

/**
 * Finds what past lots like this one sold for.
 *
 * Reads each candidate page, keeps the ones that state a sold price, and stops
 * once it has enough. A page that was withdrawn, passed in or is still running
 * is skipped rather than counted, because a lot nobody bought has no price.
 */
export async function findAuctionResults(
  subject: QuerySubject,
  options: { limit?: number; now?: Date } = {},
): Promise<{ results: AuctionResult[]; pagesFetched: number }> {
  const limit = options.limit ?? MOST_RESULTS_PER_LOT;

  // Our own archive first. Decision record 0021: the harvester records what
  // every lot we have read actually fetched, and reading it back costs one
  // database query rather than a search and a page fetch each. It is also the
  // better evidence, because we recorded it ourselves rather than finding it
  // through whatever a search engine happened to crawl.
  const found: AuctionResult[] = await fromOurArchive(subject, {
    limit,
    now: options.now,
  }).catch(() => []);
  let pagesFetched = 0;

  // Only what the archive could not supply is searched for.
  if (found.length >= limit) return { results: found, pagesFetched };

  for (const site of RESULT_SITES) {
    if (found.length >= limit) break;

    const query = resultQueryFor(subject, site.host);
    if (!query) break;

    let candidates: SearchResult[];
    try {
      candidates = lotPagesAmong(await brave.search(query, { count: 10 }), site.lotPath);
    } catch {
      // One auction house being unreachable is not a reason to skip the other.
      continue;
    }

    for (const candidate of candidates) {
      if (found.length >= limit) break;
      try {
        const page = await fetchPage(candidate.url);
        pagesFetched += 1;
        const result = parseGraysResult(page.markdown);
        if (!result) continue;
        found.push({
          ...result,
          url: candidate.url,
          title: candidate.title,
          sourceName: site.name,
          ageInDays: ageInDays(result.closedAt, options.now),
        });
      } catch {
        // A page we may not read, or cannot reach, is simply not evidence.
      }
    }
  }

  return { results: found, pagesFetched };
}
