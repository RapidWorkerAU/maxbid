# 0001 Light theme only for V1

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

Four documents required a dark theme and two forbade it. D39 chose light and dark following the system, CS40 defaulted the user Theme preference to Follow system, docs/04-build/architecture.md required a story in light and dark theme for every component, and docs/03-design/ux-standards.md required contrast checks in both themes. Against that, D93 chose light pages with navy panels and called dark mode a later option, and C02 in docs/03-design/design-system.md said a dark app theme can be added later from the same tokens.

No signed off prototype in docs/03-design/prototypes.md shows a dark screen, so the requirement had no design behind it. Building it would have doubled the token set and every component story in Week 1.

## Options considered

1. Build light and dark in Week 1. Honours D39 and CS40, but doubles the token and story work and has no approved design to build against.
2. Build light only and defer dark. Matches the signed off prototypes and C02, and leaves the token structure able to add dark later.

## Decision

V1 ships a light theme only. Pages are light with navy panels, exactly as the signed off prototypes show. Dark mode stays a later option and will need its own decision record and its own prototypes before anyone builds it.

Component stories render in the light theme only. Contrast is checked on light pages and on navy panels, which are the two surfaces that exist.

## Consequences

1. D39 in docs/01-decisions/decision-register.md is amended to light only.
2. CS40 in docs/02-specs/configuration.md changes from Follow system to Light, with dark recorded as unavailable in V1.
3. docs/04-build/architecture.md drops the dark theme from the packages/tokens row and from the stories requirement in the component file pattern.
4. docs/03-design/ux-standards.md checks contrast on light pages and navy panels instead of in both themes.
5. packages/tokens ships one light set. The token names stay semantic so a dark set can be added later without renaming anything.
