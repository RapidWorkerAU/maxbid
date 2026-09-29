import { describe, expect, it } from 'vitest';
import { graysVehicleSchedule } from './examples';
import {
  NO_PREMIUM,
  PremiumScheduleError,
  assertValidSchedule,
  effectiveRateAt,
  flatRate,
  premiumAt,
} from './premium';

describe('a premium that is one rate at every price', () => {
  it('charges that rate', () => {
    expect(premiumAt(flatRate(0.165), 10000)).toBeCloseTo(1650, 10);
  });

  it('charges nothing when the auction has no premium', () => {
    expect(premiumAt(NO_PREMIUM, 10000)).toBe(0);
  });
});

describe('the Grays vehicle schedule', () => {
  // Every figure here is from the sale page, and the effective rates were
  // measured against the 36 lots that sale held.
  it.each([
    [309, 495],
    [2000, 495],
    [2001, 650],
    [5000, 650],
    [5001, 710],
    [10000, 710],
    [10001, 700.07],
    [21700, 1519],
    [30000, 2100],
    [30001, 1800.06],
    [50000, 2500],
  ])('charges %d dollars a premium of %d', (hammer, expected) => {
    expect(premiumAt(graysVehicleSchedule, hammer)).toBeCloseTo(expected, 2);
  });

  it('charges more than the lot is worth at the bottom of the sale', () => {
    // A $309 lot carries a $495 premium. This is the case a single rate
    // cannot express, and the reason for decision record 0015.
    expect(effectiveRateAt(graysVehicleSchedule, 309)).toBeGreaterThan(1.6);
  });

  it('falls to seven percent by the top of the sale', () => {
    expect(effectiveRateAt(graysVehicleSchedule, 21700)).toBeCloseTo(0.07, 10);
  });

  it('charges less in total at $10,001 than at $10,000', () => {
    // The edge where paying a dollar more costs nine dollars less, because a
    // fixed $710 gives way to 7 percent. Any solver that assumes cost rises
    // with price walks past this.
    const at10000 = 10000 + premiumAt(graysVehicleSchedule, 10000);
    const at10001 = 10001 + premiumAt(graysVehicleSchedule, 10001);
    expect(at10001).toBeLessThan(at10000);
    expect(at10000 - at10001).toBeCloseTo(8.93, 2);
  });

  it('charges more in total at $2,001 than at $2,000', () => {
    // The edge that runs the other way, so a solver has to handle both.
    const at2000 = 2000 + premiumAt(graysVehicleSchedule, 2000);
    const at2001 = 2001 + premiumAt(graysVehicleSchedule, 2001);
    expect(at2001 - at2000).toBeCloseTo(156, 2);
  });
});

describe('refusing a schedule that cannot be read without ambiguity', () => {
  it('accepts the real schedules', () => {
    expect(() => assertValidSchedule(graysVehicleSchedule)).not.toThrow();
    expect(() => assertValidSchedule(flatRate(0.165))).not.toThrow();
  });

  it('refuses a schedule with no bands', () => {
    expect(() => assertValidSchedule({ bands: [] })).toThrow(PremiumScheduleError);
  });

  it('refuses a schedule that stops at a price', () => {
    // Without a top band, a lot above the last limit has no premium at all,
    // which would read as a free premium rather than an unreadable schedule.
    expect(() =>
      assertValidSchedule({ bands: [{ upTo: 2000, kind: 'fixed', amount: 495 }] }),
    ).toThrow(/cover every price above it/);
  });

  it('refuses bands that do not rise', () => {
    expect(() =>
      assertValidSchedule({
        bands: [
          { upTo: 5000, kind: 'fixed', amount: 650 },
          { upTo: 2000, kind: 'fixed', amount: 495 },
          { upTo: null, kind: 'rate', rate: 0.05 },
        ],
      }),
    ).toThrow(/must rise/);
  });

  it('refuses a negative amount', () => {
    expect(() => assertValidSchedule(flatRate(-0.1))).toThrow(/zero or more/);
  });
});
