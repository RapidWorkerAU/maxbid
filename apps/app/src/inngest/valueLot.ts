// S5 Triage value, for one lot. F14, decision records 0018 and 0019.
//
// Search, read the results, fill in what the snippets left out, then hand the
// comparables to the valuation maths in @maxbid/calc. No maths happens here:
// rule 6 keeps it all in one place.

import { valueComparables, type Valuation } from '@maxbid/calc';
import { ask } from '../ai/claude';
import { TRIAGE_MODEL } from '../ai/pricing';
import {
  READ_LISTINGS_PROMPT_VERSION,
  SYSTEM_PROMPT,
  capForUnknownUsage,
  readListings,
  userPromptFor,
  type ReadListing,
} from '../ai/readListings';
import { fetchPage } from '../extract/firecrawl';
import { findAuctionResults, type AuctionResult } from '../search/auctionResults';
import { brave, type SearchResult } from '../search/brave';
import { queryFor, type QuerySubject } from '../search/query';
import { MATERIAL_USAGE_GAP, readUsage, usageGap } from '../search/usage';
import { allComparables, enoughOnTheirOwn } from './evidence';

export const STAGE = 'S5';

/** How many results to ask for. More costs the same and reads the same. */
const RESULTS = 10;

/**
 * How many listing pages we will fetch for one lot.
 *
 * Each is a page fetch, and unit-costs.md budgets two cents a lot for the
 * whole of triage. Only the comparables that might change the answer are
 * fetched, so this is a ceiling rather than a target.
 */
const MOST_PAGES_PER_LOT = 4;

export type ValuedComparable = ReadListing & {
  result: SearchResult;
  /** Kilometres, whether the snippet said so or the listing page did. */
  kilometres: number | null;
  /** True when we paid to fetch the page to find out. */
  pageFetched: boolean;
};

export type LotValuation = {
  query: string | null;
  results: number;
  /** Past sales of the same thing. The evidence that actually carries weight. */
  auctionResults: AuctionResult[];
  comparables: ValuedComparable[];
  valuation: Valuation | null;
  costUsd: number;
  pagesFetched: number;
};

const NOTHING: Omit<LotValuation, 'query' | 'results'> = {
  auctionResults: [],
  comparables: [],
  valuation: null,
  costUsd: 0,
  pagesFetched: 0,
};

/** Reads a kilometre figure out of whatever the model wrote in usage. */
export function kilometresFrom(usage: string | null): number | null {
  if (!usage) return null;
  const digits = usage.replace(/[^\d]/g, '');
  const value = Number(digits);
  return Number.isFinite(value) && value >= 100 && value <= 1_500_000 ? value : null;
}

/**
 * Grades a comparable once we know as much about its usage as we are going to.
 * Decision record 0019.
 *
 * Three outcomes. Where the usage is still unknown after a page fetch, the
 * comparable is capped, because an unknown difference is not the same as no
 * difference. Where it is known and far from the lot's, the comparable is a
 * higher or a lower specification: one that has done much less is worth more
 * than the lot and so overstates its value, and one that has done much more
 * understates it. Where it is known and close, the grade the model gave
 * stands, which is the whole point of having looked.
 */
export function gradeForUsage(
  given: ReadListing['matchLevel'],
  lotKilometres: number | null,
  comparableKilometres: number | null,
): ReadListing['matchLevel'] {
  // Usage only matters where the lot has any. A desktop computer has no
  // odometer and never will, so an unknown reading on a comparable says
  // nothing about it.
  //
  // This order was the other way round, and it capped every comparable in a
  // 40 lot IT sale at similarAlternative. Nothing cleared the evidence
  // threshold and not one lot was valued, on a rule written for cars.
  if (lotKilometres === null) return given;
  if (comparableKilometres === null) return capForUnknownUsage(given);
  if (usageGap(lotKilometres, comparableKilometres) < MATERIAL_USAGE_GAP) return given;
  return comparableKilometres < lotKilometres ? 'higherSpec' : 'lowerSpec';
}

/** Which comparables are worth paying to look at properly. */
export function worthFetching(listings: ReadListing[]): ReadListing[] {
  return listings
    .filter((listing) => kilometresFrom(listing.usage) === null)
    .slice(0, MOST_PAGES_PER_LOT);
}

export type ValueLotInput = {
  subject: QuerySubject;
  /** The lot's own odometer, from its catalogue card. */
  lotKilometres: number | null;
  /** The lot in words, for the model to compare listings against. */
  describedAs: string;
  where: { orgId: string; analysisId: string; lotId: string };
};

/**
 * Values one lot.
 *
 * Returns a valuation of null when there was nothing to search on. That is a
 * real answer: a lot we cannot identify is a lot we cannot price, and saying
 * so is better than pricing it against whatever a vague search returned.
 */
export async function valueLot(input: ValueLotInput): Promise<LotValuation> {
  const query = queryFor(input.subject);
  if (!query) return { query: null, results: 0, ...NOTHING };

  // Past sales first. Decision record 0020: a sold price is weighted 0.95
  // against an asking price at 0.6, so three results are worth more than five
  // listings and cost less to gather.
  const past = await findAuctionResults(input.subject);
  let pagesFetched = past.pagesFetched;

  if (enoughOnTheirOwn(past.results)) {
    // Enough sold evidence that a web search would spend a call, a read and
    // often a fetch to add a comparable worth less than half as much.
    const comparables = allComparables(past.results, [], input.lotKilometres);
    return {
      query,
      results: 0,
      auctionResults: past.results,
      comparables: [],
      valuation: valueComparables({ comparables }),
      costUsd: 0,
      pagesFetched,
    };
  }

  const results = await brave.search(query, { count: RESULTS });
  if (results.length === 0) {
    const comparables = allComparables(past.results, [], input.lotKilometres);
    return {
      query,
      results: 0,
      auctionResults: past.results,
      comparables: [],
      valuation: comparables.length > 0 ? valueComparables({ comparables }) : null,
      costUsd: 0,
      pagesFetched,
    };
  }

  const reply = await ask(
    {
      model: TRIAGE_MODEL,
      system: SYSTEM_PROMPT,
      prompt: userPromptFor(input.describedAs, results),
      maxTokens: 1500,
    },
    {
      stage: STAGE,
      promptVersion: READ_LISTINGS_PROMPT_VERSION,
      orgId: input.where.orgId,
      analysisId: input.where.analysisId,
      lotId: input.where.lotId,
    },
  );

  const listings = readListings(reply.text, results.length);
  const toFetch = new Set(worthFetching(listings).map((listing) => listing.index));

  const comparables: ValuedComparable[] = [];

  for (const listing of listings) {
    const result = results[listing.index]!;
    let kilometres = kilometresFrom(listing.usage);
    let pageFetched = false;

    if (kilometres === null && toFetch.has(listing.index)) {
      try {
        const page = await fetchPage(result.url);
        kilometres = readUsage(page.markdown)?.kilometres ?? null;
        pageFetched = true;
        pagesFetched += 1;
      } catch {
        // A site that will not tell us its rules, or will not answer, is not a
        // failure of the lot. The comparable simply keeps its capped grade.
      }
    }

    comparables.push({
      ...listing,
      matchLevel: gradeForUsage(listing.matchLevel, input.lotKilometres, kilometres),
      result,
      kilometres,
      pageFetched,
    });
  }

  const forMaths = allComparables(past.results, comparables, input.lotKilometres);

  return {
    query,
    results: results.length,
    auctionResults: past.results,
    comparables,
    valuation: valueComparables({ comparables: forMaths }),
    costUsd: reply.costUsd,
    pagesFetched,
  };
}
