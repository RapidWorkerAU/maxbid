# 0028. An auction price is not a resale price

Status: Accepted

Date: 22 October 2026

## Context

Ashleigh asked why MaxBid would cap what a buyer should pay at well below the
amounts the same items were demonstrably selling for at auction, when we hold
the evidence of those sales.

The answer is that it should not, and the reason it did is a gap between the
spec and the code.

`matching-and-valuation.md` gives every evidence type a **Used for** column.

| Evidence type | Weight | Used for |
| --- | --- | --- |
| Verified outcome | 1 | Resale |
| Auction realised result | 0.95 | **Resale floor and auction market** |
| Marketplace sold listing | 0.95 | Resale |
| Pooled outcome | 0.85 | Resale |
| Used advertised listing | 0.6 | Resale ceiling |

Every sold source says Resale. The auction result says something different,
and that difference was never implemented. `valueComparables` put every
comparable into one weighted percentile, so a hammer price counted as a
resale price at the joint highest weight in the table.

## Why it matters

A hammer price is what a reseller paid to buy. A resale price is what the
public paid to own. **The gap between the two is the margin this product
exists to find.**

Averaging them together removes the thing being measured. The resale estimate
is dragged towards the price being paid in the saleroom, and then the maximum
bid is worked out by subtracting the premium, GST, costs and the buyer's
profit target from it. The figure that comes out sits below what the item
demonstrably fetches in the same room the buyer is bidding in.

Two things follow, and both are bad. The buyer would never win anything. And
the screen reads as though we think the item is worth less than it plainly
is, which is worse, because it is a statement about the item rather than
about their figures.

**This explains the accuracy measurement.** On the Grays Perth sale the
median maximum bid came out at 0.71 times what the lot actually fetched. That
was read at the time as the figures being conservative. It was not. It was a
profit margin being subtracted from a buy price instead of from a sell price,
and 0.71 is roughly what that arithmetic produces.

## Decision

Only resale evidence builds the resale range. Auction results do two other
jobs instead, which is what the spec always said.

1. **They set the floor.** Nobody resells to the public for less than
   resellers are paying each other in the saleroom, so a retail estimate
   below the auction price is the retail evidence being wrong rather than a
   bargain. The cautious end is raised to the auction median. Only the
   cautious end moves, because a floor says what a figure cannot be below
   rather than what the item is worth.
2. **They answer what it takes to win**, which is a question a bidder
   genuinely has and which nothing else we hold can answer. It is shown on
   the lot screen beside the current bid, with a sentence saying it is not
   the resale figure.

## What this costs

**It makes the evidence problem worse before it gets better.** The minimum
evidence rule counts the evidence the range is built from, because evidence
that does not build a range cannot vouch for it. Dropping auction results
from that count removes our only 0.95 weighted source in practice, since the
archive is mostly Grays results and marketplace sold data is not available
yet.

Fewer lots will get a resale range until there is more retail evidence. The
two things that fix that are **O04**, the eBay Marketplace Insights
application, which would give sold retail prices at 0.95, and **F37**, the
outcomes table, which records what the user actually resold for at a weight
of 1. Both already exist as work; this record makes them the critical path
rather than nice to have.

Lowering the threshold was considered and rejected. It would hide the problem
by standing behind figures the spec says we cannot stand behind.

Marking auction prices up to retail was also considered and rejected. The
markup would be a number we invented, and decision record 0022 says we do not
invent cost assumptions.

## Consequences

1. `valueComparables` splits the evidence and returns an `auctionMarket`
   alongside the scenarios.
2. The valuation stage no longer stops searching the web when it finds four
   auction results. They were treated as enough to value on; they can never
   be, and stopping would have guaranteed the absence of the one kind of
   evidence a resale range needs.
3. `triage_valuations` stores the auction figures beside the resale range.
4. Decision record 0021 is amended. The archive is still read first and is
   still the most reliable evidence we hold, but of what it takes to win
   rather than of what a lot resells for.
5. The valuation method version moves, so every stored range is worked out
   again under the corrected rule.
