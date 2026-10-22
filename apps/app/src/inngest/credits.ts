// Reserving, settling and refunding credits. F17, commercial.md.
//
// One credit is one deep analysed lot. A credit is reserved when the analysis
// of a lot starts and refunded if that lot fails, so a lot the user paid for
// and did not get is a lot they are not charged for.
//
// Every movement is a row. Nothing here updates a balance, because there is
// no balance to update: it is the sum of the ledger, and that is the whole
// point of the ledger being append only.

import { shortlistCost } from '@maxbid/calc';
import { createServiceSupabase } from '@maxbid/db/server';

export class NotEnoughCreditsError extends Error {
  constructor(public readonly shortfall: number) {
    super(`Not enough credits: ${shortfall} short.`);
    this.name = 'NotEnoughCreditsError';
  }
}

/** What an organisation has left, from the ledger. */
export async function creditsAvailable(orgId: string): Promise<number> {
  const { data, error } = await createServiceSupabase().rpc('credits_available', {
    target_org: orgId,
  });
  if (error) throw new Error(`Could not read the credit balance: ${error.message}`);
  return data ?? 0;
}

/**
 * Takes the credits a run will need, before it starts.
 *
 * Before, not after, because a run that spends money and then discovers it
 * could not afford to has already spent the money. F17 says a user cannot
 * exceed the credits they have, and the only moment that can be enforced is
 * this one.
 *
 * The check and the write are not one transaction, so two runs starting at
 * the same instant could both pass it. That is a real gap and it is small:
 * a run is started by a person pressing a button, the ledger records what
 * actually happened either way, and a balance that goes briefly negative is
 * visible rather than hidden. Closing it properly needs the reserve to be a
 * database function, which is worth doing when more than one person uses an
 * organisation at once.
 */
export async function reserveCredits(orgId: string, analysisId: string, lots: number) {
  if (lots <= 0) return 0;

  const cost = shortlistCost(lots, await creditsAvailable(orgId));
  if (!cost.affordable) throw new NotEnoughCreditsError(cost.shortfall);

  const { error } = await createServiceSupabase()
    .from('credit_ledger')
    .insert({
      org_id: orgId,
      delta: -cost.credits,
      reason: 'reserve',
      reference_id: analysisId,
      note: `Reserved for ${cost.lots} ${cost.lots === 1 ? 'lot' : 'lots'} of deep analysis.`,
    });
  if (error) throw new Error(`Could not reserve the credits: ${error.message}`);

  return cost.credits;
}

/**
 * Gives back the credits for lots that failed.
 *
 * commercial.md says failed lots are refunded automatically, so this is not a
 * favour and nobody has to ask. A refund of nothing is not recorded at all,
 * because the ledger refuses a movement of nought and a row that changes no
 * balance would only make it harder to read.
 */
export async function refundCredits(orgId: string, analysisId: string, lots: number) {
  if (lots <= 0) return 0;

  const { error } = await createServiceSupabase()
    .from('credit_ledger')
    .insert({
      org_id: orgId,
      delta: lots,
      reason: 'refund',
      reference_id: analysisId,
      note: `Refunded for ${lots} ${lots === 1 ? 'lot' : 'lots'} we could not analyse.`,
    });
  if (error) throw new Error(`Could not refund the credits: ${error.message}`);

  return lots;
}
