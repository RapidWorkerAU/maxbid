# 0015. The buyer's premium is a schedule, not a rate

Status: Accepted

Date: 29 September 2026

## Context

Every formula in [bid-calculation.md](../../02-specs/bid-calculation.md) treats
the buyer's premium as a single rate, written p. The cost of each dollar of
hammer price, k, is built from it, and the bid limits are found by dividing by
k. [packages/calc/src/types.ts](../../../packages/calc/src/types.ts) carries
that as `premiumRate: number`, "for example 0.165". The database matches it:
`auctions.premium_pct` and `auction_platforms.default_premium_pct` are each a
single number.

The first real auction we read says something different. The Grays Perth motor
vehicle sale states its premium as a schedule:

| Hammer price | Buyer's premium |
| --- | --- |
| $0 to $2,000 | $495 |
| $2,001 to $5,000 | $650 |
| $5,001 to $10,000 | $710 |
| $10,001 to $30,000 | 7 percent |
| $30,001 to $40,000 | 6 percent |
| $40,001 and above | 5 percent |

Below $10,000 the premium is a fixed number of dollars, not a percentage at
all. Above it, the percentage falls as the price rises.

Measured against the 36 lots in that sale, at their current bids:

1. The effective premium rate runs from **7.0 percent to 160.2 percent**.
2. **22 of the 36 lots** sit below $2,000, where the premium is a flat $495.
3. On a $309 lot the premium is $495, which is more than the lot.
4. Against a single rate of 16.5 percent, the error reaches **$2,062** on one
   lot, and it runs in both directions: far too little at the bottom of the
   sale, far too much at the top.

This is not a rounding difference. It is the difference between a target bid
that is right and one that is unusable, on the majority of lots in a real sale.

There is a second consequence that a single rate cannot express. The premium
steps at each band edge, and it steps in both directions.

Bidding $2,000 costs $495 in premium; bidding $2,001 costs $650. One more
dollar of hammer price costs $156 more.

At the next edge it runs the other way. Bidding $10,000 costs a fixed $710;
bidding $10,001 costs 7 percent, which is $700.07. One more dollar of hammer
price costs $8.93 **less**, so a $10,000 bid is a price nobody should ever
make: paying more leaves you better off.

This rules out finding the bid by searching upward until the budget runs out,
because such a search stops at $10,000 and never sees that $10,009 is both
affordable and better. Every band has to be solved in turn.

## Options

1. **Model the schedule.** `premiumRate: number` becomes a schedule of bands,
   each either a fixed amount or a percentage. The bid limit solver works out
   which band a limit falls in and checks the edges. A single rate stays valid
   as a schedule holding one band, so nothing that works today stops working.
2. **Use an effective rate per lot.** Work out the rate at the lot's current
   bid and feed that in as p. It is a small change and it is wrong in the way
   that matters: the whole job is finding the highest price worth paying, and
   that price is usually in a different band from the current bid.
3. **Defer the maths.** Store and show the premium terms, and leave the
   calculator alone until after the internal MVP.

## Decision

Option 1. The premium is modelled as a schedule.

## Consequences

Done:

1. [bid-calculation.md](../../02-specs/bid-calculation.md) has a section on the
   premium schedule and how the highest bid is found, and a fourth worked
   example where the premium is a fixed amount.
2. `packages/calc` takes a schedule. `flatRate` builds the single band case,
   so an auction charging one percentage needs no special handling, and all 60
   tests that existed before this change still pass untouched.

Still to do:

3. A migration replacing the single premium columns with a schedule.
4. S3 parsing the schedule from the auction terms rather than one number. DS12
   still covers the case where it cannot be read.
5. The screen where a user edits a schedule. F10 and D25 require the premium to
   be editable, and what they edit is now a table rather than one figure, so
   this is a component that does not exist yet.
