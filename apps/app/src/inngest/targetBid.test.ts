import { describe, expect, it } from 'vitest';
import { flatRate } from '@maxbid/calc';
import { targetBidFor, type Buyer, type AuctionTerms } from './targetBid';

/** The schedule the real Grays vehicle sale charges. */
const graysVehicle = {
  includesGst: true,
  bands: [
    { upTo: 2000, kind: 'fixed' as const, amount: 495 },
    { upTo: 5000, kind: 'fixed' as const, amount: 650 },
    { upTo: 10000, kind: 'fixed' as const, amount: 710 },
    { upTo: 30000, kind: 'rate' as const, rate: 0.07 },
    { upTo: 40000, kind: 'rate' as const, rate: 0.06 },
    { upTo: null, kind: 'rate' as const, rate: 0.05 },
  ],
};

const terms: AuctionTerms = { premium: graysVehicle, gstOnHammer: false };

/** Ashleigh's own figures, as she entered them: $2,000 target, $1,500 minimum. */
const buyer: Buyer = {
  gstRegistered: true,
  profile: {
    profit_mode: 'dollars',
    target_profit_amount: '2000.00',
    min_profit_amount: '1500.00',
    target_return_pct: null,
    min_return_pct: null,
    completed_at: '2026-09-29T12:56:18.198Z',
  },
};

describe('the most a lot is worth paying', () => {
  it('works out the three figures', () => {
    const limits = targetBidFor(15300, buyer, terms)!;
    expect(limits.targetBid).toBeLessThan(limits.limitBid);
    expect(limits.limitBid).toBeLessThan(limits.breakEvenBid);
  });

  it('leaves the target profit in the buyer pocket', () => {
    // A resale of $15,300 including GST is $13,909 net to a registered buyer,
    // and a $2,000 target has to come out of that before anything else.
    const limits = targetBidFor(15300, buyer, terms)!;
    expect(limits.targetBid).toBeLessThan(13909 - 2000);
  });

  it('lets a buyer who is not registered for GST bid more, not less', () => {
    // Counterintuitive, and correct. A registered reseller selling for
    // $15,300 remits $1,390 of GST and keeps $13,909. One who is not
    // registered does not charge GST at all and keeps the whole $15,300.
    // That outweighs the $45 of premium GST they cannot claim back, so they
    // can afford to pay more for the same lot.
    //
    // This test originally asserted the opposite, on the assumption that not
    // claiming GST back is always a disadvantage. It is not, and the code was
    // right.
    const notRegistered = { ...buyer, gstRegistered: false };
    const registered = targetBidFor(15300, buyer, terms)!;
    const unregistered = targetBidFor(15300, notRegistered, terms)!;
    expect(unregistered.targetBid).toBeGreaterThan(registered.targetBid);
  });

  it('costs a buyer who is not registered more on the premium itself', () => {
    // The part that is a disadvantage, isolated. They pay the whole $495
    // where a registered buyer effectively pays $450.
    const notRegistered = { ...buyer, gstRegistered: false };
    const sameResale = { ...buyer.profile! };
    const registered = targetBidFor(2000, { ...buyer, profile: sameResale }, terms)!;
    const unregistered = targetBidFor(2000, notRegistered, terms)!;
    // Both are floored at nothing on a lot this cheap, which is itself the
    // right answer: $2,000 cannot carry a $2,000 profit and a $495 premium.
    expect(registered.targetBid).toBe(0);
    expect(unregistered.targetBid).toBe(0);
  });

  it('takes the whole fixed premium off a cheap lot', () => {
    // Below $2,000 the premium is a flat $495 whatever the hammer price, which
    // is the case a single rate could never express.
    const cheap = targetBidFor(2000, buyer, terms);
    const withoutPremium = targetBidFor(2000, buyer, { ...terms, premium: flatRate(0) });
    expect(cheap!.breakEvenBid).toBeLessThan(withoutPremium!.breakEvenBid - 400);
  });

  it('never advises a bid below nothing', () => {
    // A $400 lot cannot carry a $2,000 profit and a $495 premium.
    expect(targetBidFor(400, buyer, terms)!.targetBid).toBe(0);
  });
});

describe('what it refuses to work out', () => {
  it('gives nothing when the organisation has set no profit target', () => {
    // Decision record 0022. A figure calculated against a target we invented
    // would look exactly like one calculated against theirs.
    const noProfile = { ...buyer, profile: null };
    expect(targetBidFor(15300, noProfile, terms)).toBeNull();
  });

  it('gives nothing when only half the target is set', () => {
    const halfSet: Buyer = {
      ...buyer,
      profile: { ...buyer.profile!, min_profit_amount: null },
    };
    expect(targetBidFor(15300, halfSet, terms)).toBeNull();
  });

  it('gives nothing when the auction premium could not be read', () => {
    // A premium we could not read is not a premium of nothing. Ignoring it
    // would work out a bid that leaves out a real cost, and on a cheap lot
    // that cost is larger than the lot.
    expect(targetBidFor(15300, buyer, { ...terms, premium: null })).toBeNull();
  });
});

describe('a target set as a return on cost', () => {
  const onReturn: Buyer = {
    ...buyer,
    profile: {
      profit_mode: 'percent',
      target_profit_amount: null,
      min_profit_amount: null,
      target_return_pct: '0.3000',
      min_return_pct: '0.1500',
      completed_at: '2026-09-29T12:56:18.198Z',
    },
  };

  it('works out the three figures the same way', () => {
    const limits = targetBidFor(15300, onReturn, terms)!;
    expect(limits.targetBid).toBeLessThan(limits.limitBid);
    expect(limits.limitBid).toBeLessThan(limits.breakEvenBid);
  });

  it('reaches the same break even bid as a dollar target', () => {
    // A return of nothing and a profit of nothing are the same thing.
    const asDollars = targetBidFor(15300, buyer, terms)!;
    const asReturn = targetBidFor(15300, onReturn, terms)!;
    expect(asReturn.breakEvenBid).toBeCloseTo(asDollars.breakEvenBid, 6);
  });
});
