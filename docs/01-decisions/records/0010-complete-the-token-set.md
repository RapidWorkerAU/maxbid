# 0010 Complete the token set, and where status colour may not go

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

C01 requires every colour, type, spacing, radius and motion value to be defined once as a CSS variable, with semantic names only. Three things stood in the way.

1. **Tokens were missing.** Three of the four confidence colours did not exist. Neither did the navy panel variants of the zone colours, the confidence colours, the border, the link or `surface_muted`. No spacing or motion values existed at all, although C08 and C09 depend on them.
2. **Two names disagreed with the specification.** The table in docs/03-design/design-system.md names `border` for `#C9D6E3` and `line` for `#7FC8F8`. The code had `--color-line` for the first and `--color-cyan` for the second. C01 asks for semantic names, and `cyan` names a colour rather than a use.
3. **Three more tokens fail AA on one surface.** Auditing the whole palette while fixing `confidence_insufficient` turned this up.

| Token | Page `#F4F7FA` | White `#FFFFFF` | `surface_muted` `#E6EDF4` |
| --- | --- | --- | --- |
| link `#1B6FD1` | 4.61 | 4.95 | 4.19 fails |
| zone_green `#1E7A52` | 4.93 | 5.30 | 4.49 fails |
| zone_amber `#B45309` | 4.67 | 5.02 | 4.25 fails |
| zone_red `#B91C1C` | 6.02 | 6.47 | 5.48 |

## Options considered

1. **Darken the three colours.** They pass on the page and on white cards, where they mostly appear. Darkening approved brand colours to fix one surface changes the product's look everywhere to solve a problem in one place.
2. **Lighten `surface_muted` until they pass.** It would have to reach `#EEF5FC`, which sits at 1.022 to 1 against the page background, against 1.098 today. `surface_muted` exists to separate table headers, chips and photo placeholders from the page. At 1.022 to 1 it is no longer visibly a different surface, so the token stops doing its job.
3. **Record the constraint and let the gate enforce it.** Keep both sets of colours as they are and write down the one combination that is not allowed.

## Decision

**Status and link text does not go on `surface_muted`.** The failing combination is recorded on the `surface_muted` row in docs/03-design/design-system.md. No colour changes. The axe check that runs against every story catches any component that breaks the rule, so this is enforced rather than merely written down.

**The two names in the code change to match the specification.** `--color-line` becomes `--color-border` at `#C9D6E3`, and `--color-cyan` becomes `--color-line` at `#7FC8F8`.

**The specification changes to match the code on one name.** The table called the page background `background`. It is `page` everywhere in the code and in three files that already use it, and `page` describes the use at least as well. The document now says `page`.

**The missing tokens are added**, including the navy panel variants, using the `-on-navy` suffix that `ink-on-navy` already established.

**Spacing.** The Tailwind 4px base scale stays. Three named values join it, each taken from a figure the documents already state: `--spacing-row` at 36px and `--spacing-row-comfortable` at 44px from the Density rule, and `--spacing-touch-min` at 44px from MF03. These three are what the C09 density switch needs.

**Motion.** No document gave durations, so these are set here.

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 120ms | Hovers, focus rings, tag changes |
| `--duration-base` | 200ms | Expanding cost lines, sheets |
| `--duration-slow` | 320ms | Page and panel transitions |
| `--ease-standard` | cubic-bezier(0.2, 0, 0, 1) | Movement that starts fast and settles |
| `--ease-out` | cubic-bezier(0, 0, 0.2, 1) | Things entering the screen |

C08 still applies: every animation sits inside a reduced motion media query.

**Breakpoints need no work.** MF01 lists 640, 768, 1024 and 1280, which is exactly Tailwind's `sm`, `md`, `lg` and `xl`. Nothing is redefined.

## Consequences

1. docs/03-design/design-system.md gains the spacing and motion values, the renamed `page` row, and the note on `surface_muted`.
2. packages/tokens/tokens.css holds the complete set.
3. packages/tokens/src/index.ts, which existed for PDF exports and charts but carried only thirteen colours and none of the tag or confidence values, now matches.
4. A contrast test in packages/tokens asserts every documented pairing, including a canary on the three excluded combinations. If `surface_muted` is ever lightened, that canary fails and tells the next person the constraint can be lifted.
