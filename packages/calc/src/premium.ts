// The buyer's premium. Source: docs/02-specs/bid-calculation.md, decision
// record 0015.
//
// The premium was a single rate until the first real auction was read. The
// Grays Perth motor vehicle sale states it as a schedule, and below $10,000 it
// is a fixed number of dollars rather than a percentage at all:
//
//   $0 to $2,000       $495
//   $2,001 to $5,000   $650
//   $5,001 to $10,000  $710
//   $10,001 to $30,000 7 percent
//   $30,001 to $40,000 6 percent
//   $40,001 and above  5 percent
//
// Across the 36 lots in that sale the effective rate ran from 7 percent to
// 160 percent, so one rate cannot stand in for it. A single rate is still a
// schedule, holding one band, which is what flatRate returns.

/** One band of a premium schedule. */
export type PremiumBand = {
  /**
   * The highest hammer price this band covers. The last band uses null,
   * meaning everything above the band before it.
   */
  upTo: number | null;
} & ({ kind: 'fixed'; amount: number } | { kind: 'rate'; rate: number });

/** How an auction charges its buyer's premium. */
export type PremiumSchedule = {
  /** In ascending order of hammer price. The last band must have upTo null. */
  bands: PremiumBand[];
  /**
   * True when the amounts above already include GST, so nothing is added.
   *
   * The Grays vehicle sale says "GST is included in the buyers premium", so
   * its $495 is the whole charge. A GST registered buyer still claims the GST
   * inside it, which is the amount less the amount divided by 1.1. Decision
   * record 0016.
   */
  includesGst?: boolean;
};

/** A premium that is the same percentage at every price, as a fraction. */
export function flatRate(rate: number): PremiumSchedule {
  return { bands: [{ upTo: null, kind: 'rate', rate }] };
}

/** A schedule charging nothing, for an auction with no buyer's premium. */
export const NO_PREMIUM: PremiumSchedule = flatRate(0);

export class PremiumScheduleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PremiumScheduleError';
  }
}

/**
 * Refuses a schedule that cannot be read without ambiguity.
 *
 * A schedule decides what a user is advised to bid, so a malformed one must
 * stop the calculation rather than quietly charge the wrong premium.
 */
export function assertValidSchedule(schedule: PremiumSchedule): void {
  const { bands } = schedule;
  if (bands.length === 0) {
    throw new PremiumScheduleError('A premium schedule needs at least one band.');
  }

  const last = bands[bands.length - 1]!;
  if (last.upTo !== null) {
    throw new PremiumScheduleError(
      'The last band of a premium schedule must cover every price above it, so its upper limit must be null.',
    );
  }

  let previous = 0;
  for (const band of bands.slice(0, -1)) {
    if (band.upTo === null) {
      throw new PremiumScheduleError('Only the last band of a premium schedule may have no upper limit.');
    }
    if (band.upTo <= previous) {
      throw new PremiumScheduleError(
        `The bands of a premium schedule must rise. ${band.upTo} does not come after ${previous}.`,
      );
    }
    previous = band.upTo;
  }

  for (const band of bands) {
    const value = band.kind === 'fixed' ? band.amount : band.rate;
    if (!Number.isFinite(value) || value < 0) {
      throw new PremiumScheduleError('Every band of a premium schedule needs an amount of zero or more.');
    }
  }
}

/** The band that applies at a hammer price, with the range it covers. */
export type BandRange = {
  band: PremiumBand;
  /** The lowest hammer price in this band. The first band starts at zero. */
  from: number;
  /** The highest, or null for the top band. */
  to: number | null;
};

/** Each band with the hammer prices it covers, which the solver walks. */
export function bandRanges(schedule: PremiumSchedule): BandRange[] {
  let from = 0;
  return schedule.bands.map((band) => {
    const range = { band, from, to: band.upTo };
    // The next band starts a dollar above this one, but the maths works in
    // exact amounts, so it starts wherever this one stops.
    from = band.upTo ?? from;
    return range;
  });
}

/** What the premium costs at a hammer price. */
export function premiumAt(schedule: PremiumSchedule, hammer: number): number {
  const band = schedule.bands.find((b) => b.upTo === null || hammer <= b.upTo);
  if (!band) return 0;
  return band.kind === 'fixed' ? band.amount : hammer * band.rate;
}

/**
 * What the buyer actually hands over in premium.
 *
 * Either the schedule already includes GST, in which case the stated amount
 * is the whole charge, or it does not and GST is added where it applies.
 */
export function premiumChargedAt(
  schedule: PremiumSchedule,
  hammer: number,
  gstOnPremium: boolean,
  gstRate: number,
): number {
  const amount = premiumAt(schedule, hammer);
  if (schedule.includesGst) return amount;
  return amount * (1 + (gstOnPremium ? gstRate : 0));
}

/**
 * The GST inside that charge, which a registered buyer claims back.
 *
 * When the schedule includes GST the amount has to be worked backwards out of
 * the charge. Multiplying by the rate would overstate it, because the GST is
 * a tenth of the price before tax, not a tenth of the price after it.
 */
export function premiumGstAt(
  schedule: PremiumSchedule,
  hammer: number,
  gstOnPremium: boolean,
  gstRate: number,
): number {
  const amount = premiumAt(schedule, hammer);
  if (schedule.includesGst) return amount - amount / (1 + gstRate);
  return gstOnPremium ? amount * gstRate : 0;
}

/**
 * The premium as a fraction of the hammer price.
 *
 * Only for showing a user what they are paying. Never feed this back into the
 * maths as a rate: on a fixed band it changes with every dollar bid, which is
 * exactly the mistake this schedule exists to prevent.
 */
export function effectiveRateAt(schedule: PremiumSchedule, hammer: number): number {
  return hammer === 0 ? 0 : premiumAt(schedule, hammer) / hammer;
}
