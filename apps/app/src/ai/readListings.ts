// Reading prices out of search results. S5, F14.
//
// A regular expression is not enough, and the first live search showed why.
// Searching for a 2015 Outlander returned this, on a page of otherwise
// relevant results:
//
//   autotrader.com.au  $25,990
//   "2020 Mitsubishi Outlander LS, AWD, 2.2lt, Turbo Diesel, 6 Speed..."
//
// That is a 2020 car. Taken as a comparable it would lift the valuation of a
// 2015 lot by thousands, and nothing in the number itself says so. Only the
// words around it do. This is why pipeline.md always said S5 uses a small
// model to read the results.

/** Changing the prompt changes the answers, so every run records which one. */
export const READ_LISTINGS_PROMPT_VERSION = 'triage-read-listings-1';

/** How well a listing matches the lot. These are the levels in @maxbid/calc. */
export type ListingMatch =
  | 'exact'
  | 'nearExact'
  | 'higherSpec'
  | 'lowerSpec'
  | 'similarAlternative'
  | 'insufficient';

export type ReadListing = {
  /** Which result this came from, as its position in the list we gave. */
  index: number;
  price: number;
  /** True when the listing states an asking price rather than a sold price. */
  advertised: boolean;
  matchLevel: ListingMatch;
  /** Plain English, shown to the user beside the figure. */
  reason: string;
  year: number | null;
};

export const SYSTEM_PROMPT = [
  'You read search results and pick out the ones that are genuinely the same',
  'item as an Australian auction lot, so its resale value can be estimated.',
  '',
  'Reply with JSON only, in this shape:',
  '{"listings": [{"index": number, "price": number, "advertised": boolean,',
  '  "matchLevel": string, "reason": string, "year": number|null}]}',
  '',
  'Rules:',
  '1. Only include a result where the snippet states a price for a specific',
  '   item. Skip review pages, specification pages and category pages that',
  '   list many different items, because their price belongs to something',
  '   else or to nothing.',
  '2. Check the year. A result for a different year is a different item and a',
  '   different price. Either leave it out, or include it and say so in the',
  '   reason with matchLevel higherSpec or lowerSpec.',
  '3. price is a plain number of Australian dollars, with no symbol, no commas',
  '   and no text.',
  '4. advertised is true for an asking price, which is most listings, and',
  '   false only where the snippet says the item sold for that figure.',
  '5. matchLevel is one of exact, nearExact, higherSpec, lowerSpec,',
  '   similarAlternative, insufficient. Use exact only when the year, make,',
  '   model and variant all agree.',
  '6. reason is one sentence a person can check, naming what agrees and what',
  '   does not. Write plainly, and no dashes.',
  '7. Return an empty list when nothing is usable. That is a real answer and a',
  '   far better one than a price belonging to a different item.',
].join('\n');

export type ListingForReading = { title: string; snippet: string; host: string };

/** The words the model reads, numbered so it can point back at them. */
export function userPromptFor(lot: string, results: ListingForReading[]): string {
  return [
    `The lot: ${lot}`,
    '',
    'Search results:',
    ...results.map(
      (result, index) => `${index}. [${result.host}] ${result.title}\n   ${result.snippet}`,
    ),
  ].join('\n');
}

const MATCH_LEVELS: ListingMatch[] = [
  'exact',
  'nearExact',
  'higherSpec',
  'lowerSpec',
  'similarAlternative',
  'insufficient',
];

/**
 * Reads the model's answer, keeping only rows that hold together.
 *
 * A row is dropped rather than repaired. A comparable with a made up price or
 * a missing reason cannot be shown to a user as evidence, and it would still
 * pull the valuation.
 */
export function readListings(reply: string, resultCount: number): ReadListing[] {
  const cleaned = reply.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return [];
  }

  const rows = (parsed as { listings?: unknown })?.listings;
  if (!Array.isArray(rows)) return [];

  const out: ReadListing[] = [];
  for (const item of rows) {
    const row = item as Record<string, unknown>;

    const index = typeof row.index === 'number' ? row.index : Number.NaN;
    // A listing pointing at a result we never sent cannot be checked by
    // anyone, so it is not evidence.
    if (!Number.isInteger(index) || index < 0 || index >= resultCount) continue;

    const price = typeof row.price === 'number' ? row.price : Number.NaN;
    if (!Number.isFinite(price) || price <= 0) continue;

    const matchLevel = MATCH_LEVELS.find((level) => level === row.matchLevel);
    if (!matchLevel) continue;

    const reason = typeof row.reason === 'string' ? row.reason.trim() : '';
    // F62 shows the reason beside the figure. Without one the user cannot tell
    // why a price is being counted, so the price does not count.
    if (reason.length === 0) continue;

    const year = typeof row.year === 'number' && Number.isInteger(row.year) ? row.year : null;

    out.push({
      index,
      price,
      advertised: row.advertised !== false,
      matchLevel,
      reason,
      year,
    });
  }

  // One result cannot be two comparables, so the first reading of each wins.
  const seen = new Set<number>();
  return out.filter((row) => (seen.has(row.index) ? false : (seen.add(row.index), true)));
}
