# Design System

Blueprint direction. Light pages, navy panels, data dense and precise. Signed off 22 September 2026.

Source: MaxBid Project Workbook, tab 17 Design System.

**Principles.** Numbers first. Calm neutral surfaces. Colour used only for meaning: profit zones, confidence and match levels. Every figure shows its basis on hover or tap.

**Typography.** Barlow 700 to 800 for headings and bid figures. Barlow 400 to 600 for body and interface text, with tabular figures on all numbers. Space Mono for lot numbers, model codes and uppercase data labels. Base size 15px on desktop tables, 16px on mobile, 48px or larger for bid figures in the phone bid view. Full brand system on tab 33.

**Density.** Table rows 36px on desktop with a comfortable option at 44px. Sticky table header and first column.

**Numbers.** Whole dollars in tables, cents only in the calculator detail. Negative values in red with a minus sign replaced by parentheses in exports.

**Accessibility.** WCAG 2.2 AA contrast on light pages and navy panels. Status never shown by colour alone: every zone and badge carries a text label.

| Token | Use | Light pages | On navy panels | Notes |
| --- | --- | --- | --- | --- |
| background | Page background | #F4F7FA |  | Drafting white |
| surface | Cards, tables and search panel | #FFFFFF | #0E2A47 | Navy is the panel colour for headers, bid limits and sign up |
| surface_muted | Table headers on light, photo placeholders, chips | #E6EDF4 | rgba(255,255,255,0.14) |  |
| border | Hairlines and dividers | #C9D6E3 | #7FC8F8 at 50 percent | Double inset frame lines on navy panels |
| ink | Primary text | #0E1B2B | #FFFFFF |  |
| ink_muted | Secondary text and notes | #4A5A6D | #B7CDE3 | Disclaimer notes use this |
| accent | Marker yellow. Primary buttons, stop line, most you should bid | #FFD23F fill with #0E1B2B text | #FFD23F fill with #0E1B2B text | Never used for status or as text colour |
| line | Drafting lines and labels on navy |  | #7FC8F8 | Title blocks, mono labels, frame lines |
| link | Links, icons, index numbers | #1B6FD1 | #7FC8F8 |  |
| zone_green | Meets profit target | #1E7A52 | #6EE7B7 | Label: On target |
| zone_amber | Profitable, below target | #B45309 | #FBBF24 | Label: Below target. Distinct from marker yellow |
| zone_red | Break even or loss | #B91C1C | #F87171 | Label: Loss risk |
| tag_verified | Verified tag | #1E7A52 fill, white text |  |  |
| tag_extracted | Extracted tag | #E6EDF4 fill, ink text |  |  |
| tag_estimated | Estimated tag | #FFF4CC fill, ink text |  |  |
| tag_your_input | Your input tag | #1B6FD1 fill, white text |  |  |
| confidence_high | High confidence | #1E7A52 | #6EE7B7 |  |
| confidence_medium | Medium confidence | #0E1B2B | #FFFFFF |  |
| confidence_low | Low confidence | #B45309 | #FBBF24 |  |
| confidence_insufficient | Not enough evidence | #6B7280 | #9CA3AF |  |

| Component | Specification |
| --- | --- |
| Match level badge | Pill with icon and text. Exact and Near exact solid. Spec and alternative outlined. Insufficient grey. |
| Confidence badge | Pill with label and score on hover. |
| Bid slider | Track coloured by zone with markers at target, absolute maximum and break even. Live readout of profit and return. |
| Cost summary | One line total with a chevron to expand line items. Flag icon when selling fees are blank. |
| Evidence row | Source, price, date checked, match badge, one line reason, expand for differences, external link icon. |
| Stop line | Marker yellow bar at the break even price, with a yellow Stop bidding panel in the phone bid view. |


# Visual Identity and CSS

Blueprint direction, based on engineering drawings. Signed off 22 September 2026.

Source: MaxBid Project Workbook, tab 33 Visual Identity.

## Brand palette

| Colour | Value | Role | Rule |
| --- | --- | --- | --- |
| Blueprint navy | #0E2A47 | Header, footer and feature panels | Always paired with white text and cyan lines |
| Drafting white | #F4F7FA | Page background | Cool off white |
| Line cyan | #7FC8F8 | Frame lines, labels and title blocks on navy | Decorative and label use only on navy |
| Marker yellow | #FFD23F | Primary buttons, stop line, most you should bid | Always with ink text. Never used for status |
| Pen blue | #1B6FD1 | Links, icons, index numbers, Your input tag |  |
| Ink | #0E1B2B | Text |  |
| Status colours | #1E7A52, #B45309, #B91C1C | On target, below target, loss risk | Always with a text label |

## Typography

| Role | Font | Use | Rule |
| --- | --- | --- | --- |
| Headings and figures | Barlow 700 to 800 | Headlines, bid figures, card titles | Fluid size with clamp. Normal capitalisation |
| Body and interface | Barlow 400 to 600 | Body text, buttons, forms | Tabular figures on for every number |
| Labels and data | Space Mono 400 to 700 | Lot numbers, data labels, title blocks, tags | Uppercase labels with wide letter spacing |

## Blueprint details

| ID | Detail | Specification |
| --- | --- | --- |
| B01 | Drawing sheet frame | Navy panels carry a double inset frame in line cyan, like the border of a drawing sheet. |
| B02 | Title block | The homepage header carries a small title block in the corner: project, sheet and region. |
| B03 | Detail labels | Result cards are labelled DETAIL A, DETAIL B and so on in a navy tab, like views on a drawing. |
| B04 | Mono labels | Small uppercase Space Mono labels above figures, such as MOST YOU SHOULD BID. |
| B05 | Leader dots | Dotted leader lines connect labels to figures in cost lists and side panels. |
| B06 | Measurement lines | Dimension lines with end ticks mark totals, such as the split bar on the homepage. |
| B07 | Line icons | Simple 1.4px stroke icons in pen blue for categories and actions. |
| B08 | Sharp geometry | 2px corner radius. Hairline borders instead of shadows. |
| B09 | Yellow means act | Marker yellow appears only on the main action and the most you should bid figure, so the eye goes there first. |
| B10 | Avoid | Gradient blobs, glassmorphism, stock photos, generic AI sparkle icons, soft rounded cards with heavy shadows. |

## CSS architecture

| ID | Area | Rule |
| --- | --- | --- |
| C01 | Tokens | All colour, type, spacing, radius and motion values defined once as CSS variables in the Tailwind v4 theme. Semantic names only: ink, surface, accent, zone_green. |
| C02 | Theming | Light pages by default with a navy panel token set for headers and feature panels. A dark app theme can be added later from the same tokens. |
| C03 | Components | shadcn/ui restyled to the tokens. One component library shared by site and app. |
| C04 | Layout | CSS grid for page structure, container queries for cards, logical properties for spacing. |
| C05 | Fluid type | clamp based type scale so headings scale smoothly from phone to desktop. |
| C06 | Focus | 3px marker yellow focus outline with offset on every interactive element. Never removed. |
| C07 | Performance | Marketing pages are server components with minimal client JavaScript. Fonts self hosted. Images through next/image in AVIF or WebP. |
| C08 | Motion | Durations and easing as tokens. All animation wrapped in a reduced motion media query. |
| C09 | Density | App tables support standard and comfortable density through a single token switch. |
| C10 | Quality gates | Visual regression snapshots of key components, contrast tests and axe checks in CI. |
