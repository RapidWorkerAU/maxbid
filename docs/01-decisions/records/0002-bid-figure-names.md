# 0002 Names for the three bid figures

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

The calculator produces three figures. Under the old names they were the target bid, the absolute maximum and break even. In the worked example the target bid is $7,936.01, the absolute maximum is $10,081.94 and break even is $11,369.49.

The maths is correct, but the name absolute maximum is wrong for what the figure does. It is not the highest bid on the screen. Break even sits above it. A user who reads absolute maximum will reasonably think nothing can be higher, and the figure above it is the one that costs them money. WR03 in docs/03-design/brand-and-writing.md requires every term to be explained where it first appears, and a term that means the opposite of what it says cannot be explained well.

## Options considered

1. Keep the names and explain them harder. The explanation has to work against the plain meaning of the word every time.
2. Rename the middle figure so the three names describe what each one is. Requires one pass across the documents and the packages.

## Decision

The three figures are named as follows, everywhere, in documents, in code and in anything a user reads.

1. **Target bid.** The highest bid that still meets the target profit. Shown to the user as the most you should bid.
2. **Limit bid.** The highest bid that still meets the minimum acceptable profit. This replaces absolute maximum.
3. **Break even bid.** The bid at which estimated profit is zero. Any bid above it loses money. The marker yellow stop line marks this price on screen.

## Consequences

1. Every document that used absolute maximum now uses limit bid, and every document that named break even as a figure now names the break even bid.
2. D21 and D55 in docs/01-decisions/decision-register.md are amended. D21 also drops the phrase Most I Would Pay in favour of the most you should bid.
3. DS05 in docs/02-specs/disclaimers.md and in packages/content changes to name the limit bid.
4. packages/calc renames the absoluteMax field to limitBid and breakEven to breakEvenBid. This lands in the calculator pull request, not this one.
5. UI19 BidRail and UI21 BidLimits in docs/04-build/architecture.md label the three markers with the new names.
