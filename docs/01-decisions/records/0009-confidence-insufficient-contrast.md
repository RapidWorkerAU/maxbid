# 0009 Darken confidence_insufficient so it meets WCAG AA

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

The accessibility gate added in the quality gates pull request found this on its first run, before any deliberate test failure was written. It was not a fault in a component. It was a fault in a token.

`confidence_insufficient` was `#6B7280`. Measured against the surfaces it actually appears on:

| Surface | Value | Contrast | Result |
| --- | --- | --- | --- |
| Page, drafting white `#F4F7FA` | `#6B7280` | 4.49 to 1 | Fails AA |
| Card surface, white `#FFFFFF` | `#6B7280` | 4.83 to 1 | Passes |
| `surface_muted` `#E6EDF4` | `#6B7280` | 4.09 to 1 | Fails AA |

D102 commits the product to WCAG 2.2 AA, which needs 4.5 to 1 for normal text. F26 puts a Not enough evidence label on every lot that lacks defensible comparables, so this token is not a rare decoration. It appears wherever the platform is being honest about weak evidence, which is exactly where a user must be able to read it.

## Options considered

1. Leave the token and avoid the two failing surfaces. The failing surface includes the page background, which is the most common surface in the product, so this is not workable.
2. Darken the token until it passes on every surface it is used on.

## Decision

`confidence_insufficient` becomes `#5B6472`.

| Surface | Contrast | Result |
| --- | --- | --- |
| Page, drafting white `#F4F7FA` | 5.56 to 1 | Passes |
| Card surface, white `#FFFFFF` | 5.98 to 1 | Passes |
| `surface_muted` `#E6EDF4` | 5.07 to 1 | Passes |

The colour stays a neutral grey, so nothing about the visual language changes. It is simply dark enough to read.

## Consequences

1. The token changes in three places: the table in docs/03-design/design-system.md, packages/tokens/tokens.css and packages/tokens/src/index.ts.
2. The component register overview page in Storybook returns to this token, having used ink_muted as a temporary stand in.
3. A contrast test in packages/tokens now asserts this pairing, so the value cannot regress without the build failing.
