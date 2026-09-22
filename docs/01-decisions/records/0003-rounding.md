# 0003 Rounding of bid limits and money figures

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

CS02 in docs/02-specs/configuration.md said to round to whole dollars for display and keep cents internally. It did not say which direction. For a bid limit the direction decides whether the platform can tell a user to bid more than the evidence supports. Rounding $7,936.01 up to $7,937 hands back a dollar of margin that the maths said was not there.

## Options considered

1. Round every figure to the nearest dollar. Simple, but it can round a bid limit up past the true limit.
2. Round bid limits down and everything else to the nearest dollar. The bid limits then stay inside the maths in every case.

## Decision

1. Every calculation runs unrounded, in cents, from end to end.
2. The three bid limits are rounded down to the nearest whole dollar whenever they are shown on screen or written to an export. A bid limit is never rounded up.
3. Every other money figure, such as a cost line, a profit or a total, rounds to the nearest dollar for display.
4. The calculator detail may show cents where docs/03-design/design-system.md already allows it. The rounding rules apply to the displayed figure, never to the stored one.

## Consequences

1. CS02 in docs/02-specs/configuration.md records the direction.
2. The Numbers paragraph in docs/03-design/design-system.md records the direction.
3. docs/02-specs/bid-calculation.md gains a rounding section.
4. packages/calc returns unrounded values and exposes a rounding helper for display. Callers never round a bid limit themselves. This lands in the calculator pull request.
