// Working a range out again from evidence we already hold. F62.
//
// An exclusion does not change what the lot is, so the comparables we found
// are still the right comparables. Searching again would spend fetches and a
// model call to find the same listings and reach a different answer for a
// reason nobody asked for.
//
// So this rebuilds the comparables from the evidence tables, leaves out the
// ones this organisation set aside, and weighs what is left. No network, no
// cost, and the same maths that produced the figure in the first place.

import { valueComparables, type Comparable, type MatchLevel } from '@maxbid/calc';
import { createServiceSupabase } from '@maxbid/db/server';

/** The database spells a match level in snake case and the maths in camel. */
const MATCH_LEVELS: Record<string, MatchLevel> = {
  exact: 'exact',
  near_exact: 'nearExact',
  higher_spec: 'higherSpec',
  lower_spec: 'lowerSpec',
  similar_alternative: 'similarAlternative',
  insufficient: 'insufficient',
};

/** And an evidence type the same way. */
const EVIDENCE: Record<string, Comparable['evidenceType']> = {
  auction_result: 'auctionResult',
  marketplace_sold: 'marketplaceSold',
  advertised_used: 'advertisedUsed',
  new_retail: 'newRetail',
  outcome: 'verifiedOutcome',
  user_supplied: 'userSupplied',
};

/** How old a price is, in whole days. */
function ageInDays(checkedAt: string | null, now: Date): number {
  if (!checkedAt) return 0;
  const checked = new Date(checkedAt).getTime();
  if (!Number.isFinite(checked)) return 0;
  return Math.max(0, Math.floor((now.getTime() - checked) / 86_400_000));
}

/**
 * The comparables behind one identification, as the maths reads them.
 *
 * Rebuilt from the price, the match level and the dates rather than from the
 * weight we stored, so the answer comes from the same maths that produced the
 * first one. A stored weight read back would be a figure from a method
 * version we may no longer be running.
 */
export async function comparablesFor(
  identificationId: string,
  now: Date = new Date(),
): Promise<Comparable[]> {
  const { data, error } = await createServiceSupabase()
    .from('lot_comparables')
    .select('id, match_level, comparable_snapshots(price, checked_at), comparables(source_type)')
    .eq('identification_id', identificationId);
  if (error) throw new Error(`Could not read the evidence: ${error.message}`);

  return (data ?? []).flatMap((row) => {
    const snapshot = row.comparable_snapshots as {
      price: number | null;
      checked_at: string | null;
    } | null;
    const source = (row.comparables as { source_type: string | null } | null)?.source_type ?? '';
    const price = Number(snapshot?.price);
    const evidenceType = EVIDENCE[source];

    if (!Number.isFinite(price) || price <= 0 || !evidenceType) return [];

    return [
      {
        // The id is the judgement row, which is what an exclusion names.
        id: row.id,
        price,
        matchLevel: MATCH_LEVELS[row.match_level ?? ''] ?? 'insufficient',
        evidenceType,
        ageInDays: ageInDays(snapshot?.checked_at ?? null, now),
      },
    ];
  });
}

/**
 * The range with and without the comparables somebody set aside.
 *
 * Both, because F62 says an exclusion shows the valuation before and after.
 * A figure that simply changed tells the reader nothing about what their
 * judgement did.
 */
export function rangeBeforeAndAfter(comparables: Comparable[], excluded: Set<string>) {
  const before = valueComparables({ comparables });
  const after = valueComparables({
    // Marked excluded rather than removed, so the ones set aside still appear
    // in the working with a weight of nothing. F62 and DS17 are about showing
    // the difference, and a comparable deleted from the list cannot show it.
    comparables: comparables.map((c) => ({ ...c, excluded: excluded.has(c.id) })),
  });

  return { before, after };
}
