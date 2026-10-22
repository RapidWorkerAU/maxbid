// Keeping the evidence a valuation was built from. F59.
//
// S5 gathered comparables, worked out a range and threw the comparables away.
// The range was stored and the reasoning was not, so the only thing the
// product could say about a figure was the figure.
//
// That is the opposite of what this product is for. A resale range on its own
// is a number to be taken on trust, and we do not ask anybody to trust a
// number. These three tables hold what we looked at, what it cost, how closely
// it matched and how much it counted, which is what the lot screen shows and
// what makes a figure something the reader can disagree with.
//
// Three tables, because they answer three questions that change at different
// rates. A comparable is what the thing was, and that does not change. A
// snapshot is what it cost when we looked, and prices move. lot_comparables is
// our judgement of it against one lot, and that is ours rather than the
// listing's.

import type { MatchLevel, Valuation } from '@maxbid/calc';
import { createServiceSupabase } from '@maxbid/db/server';
import type { LotValuation } from './valueLot';

/**
 * The database spells a match level in snake case and the maths in camel case.
 *
 * Worth a map rather than a string transform: a silent fallback here would
 * grade every comparable as insufficient, and the screen would say the
 * evidence was worthless when it was not.
 */
export const MATCH_LEVEL_IN_DB: Record<MatchLevel, string> = {
  exact: 'exact',
  nearExact: 'near_exact',
  higherSpec: 'higher_spec',
  lowerSpec: 'lower_spec',
  similarAlternative: 'similar_alternative',
  insufficient: 'insufficient',
};

/** One comparable, ready to store, with the id the maths knew it by. */
export type EvidenceToStore = {
  /** Matches Comparable.id from evidence.ts, such as result-0 or listing-3. */
  id: string;
  title: string;
  url: string | null;
  sourceType: 'auction_result' | 'advertised_used' | 'marketplace_sold';
  sourceName: string;
  /** Extracted where we read a page, estimated where a model read a snippet. */
  provenance: 'extracted' | 'estimated';
  price: number;
  status: 'sold' | 'active';
  year: number | null;
  /** Plain English, because the reader uses it to decide whether to trust the figure. */
  reason: string;
};

/**
 * Everything a valuation looked at, paired with the id the maths used.
 *
 * The ids are built the same way evidence.ts builds them, by position, which
 * is how a weight computed by packages/calc is matched back to the listing it
 * came from. If those two ever disagree the weights land on the wrong rows, so
 * the order here follows allComparables exactly: results first, then listings.
 */
export function evidenceFrom(valued: LotValuation): EvidenceToStore[] {
  const results = valued.auctionResults.map((result, index) => ({
    id: `result-${index}`,
    title: result.title,
    url: result.url,
    sourceType: 'auction_result' as const,
    sourceName: result.sourceName,
    // We read the result page itself, so the price is extracted rather than
    // inferred from a snippet.
    provenance: 'extracted' as const,
    price: result.hammerPrice,
    status: 'sold' as const,
    year: null,
    reason: `A past auction result for the same kind of item, which sold for $${result.hammerPrice.toLocaleString()}.`,
  }));

  const listings = valued.comparables.map((listing) => ({
    id: `listing-${listing.index}`,
    title: listing.result.title,
    url: listing.result.url,
    sourceType: listing.advertised ? ('advertised_used' as const) : ('marketplace_sold' as const),
    sourceName: listing.result.host,
    // A price the model read out of a search snippet is an estimate, unless we
    // paid to read the page, which is what pageFetched records.
    provenance: listing.pageFetched ? ('extracted' as const) : ('estimated' as const),
    price: listing.price,
    status: listing.advertised ? ('active' as const) : ('sold' as const),
    year: listing.year,
    reason: listing.reason,
  }));

  return [...results, ...listings];
}

/** What the maths decided about one comparable, keyed by the id above. */
function judgementsFrom(valuation: Valuation) {
  return new Map(
    valuation.weighted.map((weighted) => [
      weighted.id,
      {
        matchLevel: weighted.matchLevel,
        weight: weighted.weight,
        adjustedPrice: weighted.adjustedPrice,
        adjustmentPct: weighted.adjustmentPct ?? 0,
      },
    ]),
  );
}

/**
 * Stores the evidence behind one lot's valuation.
 *
 * Every comparable we weighed is kept, not only the ones that counted. A
 * comparable weighted to nothing is still part of the answer to why the range
 * is what it is, and leaving it out would make a thin valuation look better
 * evidenced than it was.
 *
 * A failure here must not lose the valuation. The range is the thing the user
 * came for, and a stored range with no evidence behind it is worse than
 * nothing only if we pretend otherwise, which the screen does not: it says
 * there are no comparable sales to show.
 */
export async function storeEvidence(
  identificationId: string,
  valued: LotValuation,
): Promise<number> {
  if (!valued.valuation) return 0;

  const supabase = createServiceSupabase();
  const judgements = judgementsFrom(valued.valuation);
  const checkedAt = new Date().toISOString();
  let stored = 0;

  for (const item of evidenceFrom(valued)) {
    const judgement = judgements.get(item.id);
    // Not weighed means not part of this valuation. Storing it would claim an
    // influence it never had.
    if (!judgement) continue;

    // A listing is the same listing whoever looks at it, and the url is what
    // says so. Without one we cannot tell a second sighting from a new
    // listing, so it becomes a new row rather than a false match.
    const comparable = item.url
      ? await supabase
          .from('comparables')
          .upsert(
            {
              source_type: item.sourceType,
              provenance: item.provenance,
              source_name: item.sourceName,
              url: item.url,
              title: item.title,
              year: item.year,
              condition: 'used',
            },
            { onConflict: 'url' },
          )
          .select('id')
          .single()
      : await supabase
          .from('comparables')
          .insert({
            source_type: item.sourceType,
            provenance: item.provenance,
            source_name: item.sourceName,
            title: item.title,
            year: item.year,
            condition: 'used',
          })
          .select('id')
          .single();
    if (comparable.error || !comparable.data) continue;

    // Dated rather than overwritten, because prices move and a range shown
    // last week has to stay explainable.
    const snapshot = await supabase
      .from('comparable_snapshots')
      .insert({
        comparable_id: comparable.data.id,
        price: item.price,
        status: item.status,
        checked_at: checkedAt,
        // Australian consumer prices include GST, and the valuation maths
        // assumes it. Saying so beats leaving the reader to guess.
        price_includes_gst: true,
      })
      .select('id')
      .single();
    if (snapshot.error || !snapshot.data) continue;

    const { error } = await supabase.from('lot_comparables').upsert(
      {
        identification_id: identificationId,
        comparable_id: comparable.data.id,
        snapshot_id: snapshot.data.id,
        match_level: MATCH_LEVEL_IN_DB[judgement.matchLevel],
        reason: item.reason,
        adjustment_pct: judgement.adjustmentPct,
        adjusted_price: judgement.adjustedPrice,
        weight: judgement.weight,
      },
      { onConflict: 'identification_id,comparable_id' },
    );
    if (!error) stored += 1;
  }

  return stored;
}
