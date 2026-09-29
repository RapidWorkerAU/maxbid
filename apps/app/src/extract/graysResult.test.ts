import { describe, expect, it } from 'vitest';
import { ageInDays, parseGraysClosedLine, parseGraysResult } from './graysResult';
import { PASSED_IN_PAGE, SOLD_PAGE, SOLD_VEHICLE_PAGE, closedLotPage } from './graysResultFixture';

describe('reading a lot that sold', () => {
  it('reads the hammer price', () => {
    expect(parseGraysResult(SOLD_PAGE)?.hammerPrice).toBe(260);
  });

  it('reads a price with a thousands separator', () => {
    expect(parseGraysResult(SOLD_VEHICLE_PAGE)?.hammerPrice).toBe(35300);
  });

  it('reads when it closed, as an instant rather than a local string', () => {
    // 25 September 2026 at 9pm AEST is 11am UTC the same day.
    expect(parseGraysResult(SOLD_PAGE)?.closedAt).toBe('2026-09-25T11:00:00.000Z');
  });

  it('reads how many bids it drew', () => {
    // A lot with one bid says a good deal less than one with 406.
    expect(parseGraysResult(SOLD_VEHICLE_PAGE)?.bidCount).toBe(406);
  });

  it('reads the odometer where the page states one', () => {
    expect(parseGraysResult(SOLD_VEHICLE_PAGE)?.kilometres).toBe(243356);
  });

  it('leaves the odometer null where it does not', () => {
    expect(parseGraysResult(SOLD_PAGE)?.kilometres).toBeNull();
  });
});

describe('refusing anything that is not a sale', () => {
  it('reads nothing from a lot that was passed in', () => {
    // Recording it would put a price on something nobody bought.
    expect(parseGraysResult(PASSED_IN_PAGE)).toBeNull();
  });

  it.each(['unsold', 'passed in', 'no sale', 'did not sell'])(
    'reads nothing from a lot marked %s beside its price',
    (wording) => {
      const page = closedLotPage().replace('Sold for', `This lot was ${wording}.

Sold for`);
      expect(parseGraysResult(page)).toBeNull();
    },
  );

  it('does not need a word list for a lot that simply never sold', () => {
    // A withdrawn lot shows no price at all, so the absence of one settles it.
    // "Withdrawn" is deliberately not in the word list, because Grays tells
    // every bidder a bid cannot be altered or withdrawn.
    expect(parseGraysResult(closedLotPage({ soldFor: null }))).toBeNull();
  });

  it('reads nothing from a lot that is still running', () => {
    // A current bid is a bid, not a price.
    const live = 'Current bid:\n\n**$809**\n\nEnds in 6h: 51m: 51s';
    expect(parseGraysResult(live)).toBeNull();
  });

  it('reads nothing without a close date', () => {
    // The date is what makes this evidence rather than an anecdote.
    const undated = SOLD_PAGE.replace(/\*\*25 September 2026 21:00 AEST\*\*/, '');
    expect(parseGraysResult(undated)).toBeNull();
  });

  it('reads nothing from a date it cannot understand', () => {
    expect(parseGraysResult(closedLotPage({ closedAt: 'last Tuesday' }))).toBeNull();
  });

  it('reads nothing from a price of nought', () => {
    expect(parseGraysResult(closedLotPage({ soldFor: '0' }))).toBeNull();
  });
});

describe('reading the closed line', () => {
  it('reads a full date with a named zone', () => {
    expect(parseGraysClosedLine('11 June 2025 21:30 AEST')).toBe('2025-06-11T11:30:00.000Z');
  });

  it('reads daylight saving as its own zone', () => {
    // AEDT is eleven hours ahead, not ten. An hour out on a close time is an
    // hour of bidding somebody did not know they had.
    expect(parseGraysClosedLine('05 November 2025 21:00 AEDT')).toBe('2025-11-05T10:00:00.000Z');
  });

  it('reads nothing it cannot be sure of', () => {
    expect(parseGraysClosedLine('sometime in June')).toBeNull();
    expect(parseGraysClosedLine('')).toBeNull();
  });
});

describe('how old a result is', () => {
  const now = new Date('2026-09-29T00:00:00.000Z');

  it('counts the days since it closed', () => {
    expect(ageInDays('2026-09-22T00:00:00.000Z', now)).toBe(7);
  });

  it('counts a year and a bit, which recency weighting halves', () => {
    expect(ageInDays('2025-06-11T11:30:00.000Z', now)).toBeGreaterThan(365);
  });

  it('never counts backwards', () => {
    expect(ageInDays('2027-01-01T00:00:00.000Z', now)).toBe(0);
  });
});

describe('the words around the price, not the whole page', () => {
  it('reads a sale whose page carries the standard bidding terms', () => {
    // Grays tells every bidder a bid "cannot be altered or withdrawn". The
    // first version of this looked for "withdrawn" across the whole page and
    // rejected every real sale it was tried on, all four of them.
    const page = closedLotPage({
      extra: 'Please take care when placing a bid, as it cannot be altered or withdrawn.',
    });
    expect(parseGraysResult(page)?.hammerPrice).toBe(260);
  });

  it('still refuses a lot whose own status says it did not sell', () => {
    const page = closedLotPage({ extra: 'Reserve not met' }).replace(
      'The auction has ended.',
      'Reserve not met. The auction has ended.',
    );
    expect(parseGraysResult(page)).toBeNull();
  });
});
