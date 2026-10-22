// An auction price is not a resale price.
//
// matching-and-valuation.md gives every evidence type a "Used for" column. An
// auction result says "Resale floor and auction market" where every other
// sold source says "Resale". That distinction was not implemented: every
// comparable went into one average, so a hammer price counted as a resale
// price at the joint highest weight.
//
// A hammer price is what a reseller paid to buy. A resale price is what the
// public paid to own. The gap between them is the margin this product exists
// to find, so averaging them together removes the thing being measured.

import { describe, expect, it } from 'vitest';
import { valueComparables, type Comparable } from './valuation';

function comp(over: Partial<Comparable> = {}): Comparable {
  return {
    id: crypto.randomUUID(),
    price: 20000,
    matchLevel: 'exact',
    evidenceType: 'marketplaceSold',
    ageInDays: 30,
    ...over,
  };
}

/** Five retail sales at $20,000, which is enough evidence on its own. */
const retail = () => [comp(), comp(), comp(), comp(), comp()];

/** Past auction results, where the same thing fetched $14,000 to buy. */
const atAuction = (price = 14000) => [
  comp({ price, evidenceType: 'auctionResult' }),
  comp({ price, evidenceType: 'auctionResult' }),
  comp({ price, evidenceType: 'auctionResult' }),
];

describe('what the resale range is built from', () => {
  it('ignores auction results when working out the resale', () => {
    // Five retail sales at $20,000 and three auction results at $14,000. The
    // resale is $20,000, because that is what the public paid.
    const both = valueComparables({ comparables: [...retail(), ...atAuction()] });
    expect(both.scenarios.expected).toBe(20000);
  });

  it('gives the same resale with or without the auction results beside it', () => {
    const alone = valueComparables({ comparables: retail() });
    const beside = valueComparables({ comparables: [...retail(), ...atAuction()] });
    expect(beside.scenarios.expected).toBe(alone.scenarios.expected);
    expect(beside.scenarios.optimistic).toBe(alone.scenarios.optimistic);
  });

  it('will not build a resale range out of auction results alone', () => {
    // However many there are. They are evidence of a different market, and a
    // bid worked out from them lands below what the item fetches in the same
    // room it is being bought in.
    const only = valueComparables({ comparables: [...atAuction(), ...atAuction()] });
    expect(only.hasEnoughEvidence).toBe(false);
    expect(only.scenarios.expected).toBeNull();
  });
});

describe('what it takes to win one', () => {
  it('reports the auction market separately', () => {
    const both = valueComparables({ comparables: [...retail(), ...atAuction()] });
    expect(both.auctionMarket).toMatchObject({ typical: 14000, results: 3 });
  });

  it('says nothing where we have no past results', () => {
    expect(valueComparables({ comparables: retail() }).auctionMarket).toBeNull();
  });

  it('reports it even when there is no resale range to show', () => {
    // What it takes to win is worth knowing on its own, and it is often all
    // we have.
    const only = valueComparables({ comparables: atAuction() });
    expect(only.hasEnoughEvidence).toBe(false);
    expect(only.auctionMarket?.typical).toBe(14000);
  });
});

describe('the floor', () => {
  it('lifts a cautious resale that sits below the auction price', () => {
    // Nobody resells to the public for less than resellers are paying each
    // other in the saleroom. A retail estimate below the hammer price is the
    // retail evidence being wrong rather than a bargain.
    const low = valueComparables({
      comparables: [
        comp({ price: 9000 }),
        comp({ price: 9500 }),
        comp({ price: 10000 }),
        comp({ price: 10500 }),
        comp({ price: 11000 }),
        ...atAuction(14000),
      ],
    });
    expect(low.scenarios.conservative).toBe(14000);
  });

  it('leaves a cautious resale that is already above it alone', () => {
    const fine = valueComparables({ comparables: [...retail(), ...atAuction(14000)] });
    expect(fine.scenarios.conservative).toBe(20000);
  });

  it('moves only the cautious end', () => {
    // The floor says what the resale cannot be below. It does not say what
    // the item is worth, so it must not drag the other two figures with it.
    const low = valueComparables({
      comparables: [
        comp({ price: 9000 }),
        comp({ price: 9500 }),
        comp({ price: 10000 }),
        comp({ price: 10500 }),
        comp({ price: 11000 }),
        ...atAuction(14000),
      ],
    });
    expect(low.scenarios.expected).toBe(10000);
    expect(low.scenarios.optimistic).toBeLessThan(14000);
  });

  it('applies no floor where there are no auction results', () => {
    const none = valueComparables({
      comparables: [comp({ price: 9000 }), comp({ price: 9500 }), comp({ price: 10000 })],
    });
    expect(none.scenarios.conservative).toBeLessThan(10000);
  });
});

describe('the margin the product exists to find', () => {
  it('leaves room between the auction price and the resale', () => {
    // The point of the fix. Before it, a hammer price averaged into the
    // resale pulled the estimate down towards the price being paid in the
    // room, and the bid figure came out below it. The first real measurement
    // put the median maximum bid at 0.71 times the hammer price.
    const both = valueComparables({ comparables: [...retail(), ...atAuction(14000)] });
    expect(both.scenarios.expected!).toBeGreaterThan(both.auctionMarket!.typical);
  });
});
