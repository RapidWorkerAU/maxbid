# Build Architecture

Library first, mobile first, small files. These rules apply to every line of code, human or AI written.

Source: MaxBid Project Workbook, tab 39 Build Architecture.

## Principles

| ID | Principle | Rule |
| --- | --- | --- |
| BA01 | Library first | Check packages/ui before writing any UI. If a component exists, use it. If it nearly fits, extend it with a prop. Build a new one only when nothing fits, and build it in Storybook first. |
| BA02 | Thin pages | A page file handles routing, metadata and data loading, then imports sections. No styling or business logic in pages. |
| BA03 | One job per file | One component per file. Hooks, types, constants and helpers in their own files. |
| BA04 | Single sources of truth | Bid maths in packages/calc. Colours, type and spacing in packages/tokens. Disclaimer and message text in packages/content. Nothing is retyped. |
| BA05 | Server first | Server components by default. Client components only for interactive leaves such as the bid slider, auction room and docket inputs. |
| BA06 | Mobile first | Every component is designed and built for a 360px screen first, then enhanced for larger screens. |
| BA07 | Tokens only | No hex values, pixel font sizes or ad hoc spacing inside components. Everything references tokens. |
| BA08 | Budgets are gates | File size, bundle size and Core Web Vitals budgets fail the build when broken. |

## Monorepo structure (Turborepo, pnpm)

| Path | Purpose | Contains | Notes |
| --- | --- | --- | --- |
| apps/web | Public site at maxbid.com.au | Marketing pages, calculators, value guides, breakdowns | Imports sections from packages/ui. Mostly static and server rendered. |
| apps/app | Product at app.maxbid.com.au | Triage, lot detail, docket, watchlist, bid view, settings | Installable web app. noindex. |
| packages/tokens | Design tokens | CSS variables, Tailwind preset, light and dark themes | Tab 17 and 33 values live here only. |
| packages/ui | Component library | Primitives, composites and sections | Catalogued in Storybook. |
| packages/calc | Bid engine | Bid limits, GST, cost totals, scenarios, confidence | Pure TypeScript, no UI. Tested against tab 10. |
| packages/content | Words | Disclaimer library, standard phrases, glossary definitions | DS01 to DS35 as named exports. |
| packages/db | Data access | Supabase generated types, typed queries, RLS test helpers | Generated type files exempt from line limits. |
| packages/config | Shared config | ESLint, TypeScript, Prettier, Vitest and Playwright settings | Line limits defined once here. |
| apps/storybook | Catalogue | Stories for every library component | Deployed privately for review. |

## Component layers

| Layer | Location | What it is | Examples |
| --- | --- | --- | --- |
| 1 Tokens | packages/tokens | Colour, type, spacing, radius, motion, breakpoints | Changed only by design decision |
| 2 Primitives | packages/ui/primitives | Smallest building blocks with no business meaning | Button, Input, Money, Badge |
| 3 Composites | packages/ui/composites | Primitives combined into a reusable product element | BidRail, EvidenceRow, Docket |
| 4 Sections | packages/ui/sections | A full band of a page built from composites | SheetHero, ClosingList |
| 5 Shells | apps/*/app/layout.tsx | Header, footer, navigation and theme around pages | One marketing shell, one app shell |
| 6 Pages | apps/*/app/**/page.tsx | Imports sections, sets metadata, loads data | 80 lines maximum |

## Component inventory

| ID | Component | Layer | Used in | Notes |
| --- | --- | --- | --- | --- |
| UI01 | Button | Primitive | Both | Primary marker yellow, secondary outline, ghost, danger. Loading and disabled states. 44px minimum height |
| UI02 | Input | Primitive | Both | Text, number, URL, email. Label, hint, error. Mono variant for figures |
| UI03 | Toggle group | Primitive | Both | GST registered, monthly or annual, theme. aria pressed |
| UI04 | Money | Primitive | Both | Formats AUD with tabular figures, parentheses for negatives, size variants up to hero |
| UI05 | MonoLabel | Primitive | Both | Uppercase mono data label |
| UI06 | ProvenanceTag | Primitive | Both | Verified, Extracted, Estimated, Your input |
| UI07 | AiLabel | Primitive | Both | AI generated marker |
| UI08 | MatchBadge | Primitive | Both | Six match levels |
| UI09 | ConfidenceBadge | Primitive | Both | High, Medium, Low, Insufficient with score |
| UI10 | ZoneLabel | Primitive | Both | On target, Below target, Loss risk. Text plus colour |
| UI11 | InfoNote | Primitive | Both | Muted 12px note with info icon. Reads text from packages/content |
| UI12 | StopLine | Primitive | Both | Marker yellow bar used as mark, tab marker, loader and limit marker |
| UI13 | SheetFrame | Primitive | Both | Double inset cyan frame for navy panels |
| UI14 | TitleBlock | Primitive | Web | Drawing title block with label and value cells |
| UI15 | DetailLabel | Primitive | Both | Navy tab label such as DETAIL A or PLAN 01 |
| UI16 | LeaderLine | Primitive | Both | Label, dotted leader and figure on one line |
| UI17 | LineIcon | Primitive | Both | Category and action icons in 1.4px pen blue stroke |
| UI18 | Wordmark | Primitive | Both | MaxBid logo with stop line |
| UI19 | BidRail | Composite | Both | Price rail with target, absolute max and stop line markers and a live cursor |
| UI20 | BidSlider | Composite | App | Proposed bid slider linked to profit readout |
| UI21 | BidLimits | Composite | Both | Target, absolute max and break even with How this was calculated expander |
| UI22 | EvidenceRow | Composite | App | One comparable with badges, tags, price, adjustment, reason and exclude |
| UI23 | PriceLine | Composite | Both | All comparables on one axis with weighted marks and scenario band |
| UI24 | SpecTable | Composite | Both | Enriched specs grouped by source class with conflict flags |
| UI25 | OptionChecklist | Composite | App | Optional equipment marked Observed, Stated, Absent or Not verified |
| UI26 | DetailCard | Composite | Both | Result card with detail label, photo area, figures and action |
| UI27 | TimeRemainingBar | Composite | Both | Closing time with a remaining time bar |
| UI28 | SplitBar | Composite | Web | Resale price split into maximum bid, costs and profit with a measurement line |
| UI29 | PriceChart | Composite | Web | 12 month price chart with typical range band, sold and asking markers |
| UI30 | PlanPanel | Composite | Web | Pricing plan as a labelled drawing panel |
| UI31 | CostSummary | Composite | App | Collapsed cost total expanding to editable lines |
| UI32 | OverrideMarker | Composite | App | Your input marker with reset action |
| UI33 | LotRow | Composite | App | Triage row on desktop, stacked row on mobile |
| UI34 | StatusLine | Composite | Both | Live status with square marker, tag and message |
| UI35 | EmailCapture | Composite | Web | Waitlist and breakdown sign up with validation and success state |
| UI36 | SiteHeader | Section | Web | Sticky header with chapter nav, theme toggle and call to action. Mobile menu sheet |
| UI37 | SiteFooter | Section | Web | Wordmark, disclaimer DS01 short form, links |
| UI38 | SheetHero | Section | Web | Navy drawing sheet header with title block and search tabs |
| UI39 | SampleResults | Section | Web | Three detail cards showing sample results |
| UI40 | CategoryTiles | Section | Web | Price guide categories as icon tiles |
| UI41 | ClosingList | Section | Web | Auctions closing soon with time remaining bars |
| UI42 | HowItWorks | Section | Web | Split bar explanation of the maximum bid |
| UI43 | SignupPanel | Section | Web | Framed navy Auction Breakdown sign up |
| UI44 | PricingPlans | Section | Web | Plan panels, comparison table and credit explainers |
| UI45 | GuideLayout | Section | Web | Price guide page with sticky summary side panel |
| UI46 | MethodSteps | Section | Web | Numbered method steps and match level table |
| UI47 | AppShell | Section | App | Sidebar on desktop, bottom tab bar on mobile, safe area aware |
| UI48 | TriageTable | Section | App | Filterable ranked lots with shortlist and credit bar |
| UI49 | LotDetail | Section | App | Identification, spec sheet, evidence, calculator. Split view on desktop, sheets on mobile |
| UI50 | BidView | Section | App | Mobile bid cards with offline cache indicator |

## File size rules

| ID | Applies to | Limit | Enforcement |
| --- | --- | --- | --- |
| FS01 | Any code file | 300 lines hard cap, 150 target | ESLint max-lines, blank lines and comments excluded. CI fails above cap. |
| FS02 | Page file | 80 lines | If a page grows, move content into a section. |
| FS03 | Function or component body | 80 lines | ESLint max-lines-per-function. |
| FS04 | Props | Around 10 props per component | More suggests splitting into smaller components. |
| FS05 | Nesting | JSX nesting depth of 6 or less | Deeper trees become child components. |
| FS06 | Exemptions | Generated Supabase types and lockfiles only | Listed in lint config. No other exceptions. |
| FS07 | Imports | Import components by path, avoid root barrel files | Keeps bundles tree shaken and small. |

## Component file pattern

**Folder per component.** packages/ui/composites/Docket/ holding Docket.tsx, Docket.stories.tsx, Docket.test.tsx, docket.types.ts, index.ts, plus child parts such as DocketLine.tsx.

**Stories required.** Default, every state and variant, light and dark theme, 375px and 1440px viewports, long content and empty content.

**Definition of done.** Tokens only, stories complete, axe check passes in the Storybook test runner, unit tests for any logic, under the line caps, props documented, visual snapshot approved.

## Mobile first rules

| ID | Rule | Detail |
| --- | --- | --- |
| MF01 | Base width | Author for 360px first. Enhance at 640, 768, 1024 and 1280px with min width queries only. |
| MF02 | Test viewports | 375 iPhone SE, 393 iPhone 15, 412 Pixel, 820 iPad, 1280 and 1440 desktop in every story and Playwright run. |
| MF03 | Touch | 44px targets, no hover only actions, swipe between lots in bid view, thumb reachable primary actions. |
| MF04 | Layout patterns | Desktop split views become full screen sheets on mobile. Tables become stacked rows with the key figure first. Sticky bottom action bar for the main action. |
| MF05 | Viewport | Dynamic viewport units, safe area insets for notches and home bars, no fixed 100vh. |
| MF06 | Installable app | Manifest with standalone display, maskable icons, theme colour, install prompt after first analysis. |
| MF07 | Offline | Service worker caches app shell, watchlist and bid view data. Shows last synced time when offline. |
| MF08 | Input | Correct keyboard types for money, email and URL fields. Paste friendly URL field. |
| MF09 | Performance on phones | Test on a mid range Android over throttled 4G. Budgets below must hold there. |
| MF10 | Desktop parity | Desktop gets density, keyboard shortcuts and split views. No feature is desktop only or mobile only unless listed in tab 07. |

## Performance budgets

| ID | Metric | Budget | Measured by |
| --- | --- | --- | --- |
| PB01 | Marketing page first load JavaScript | 130 KB gzipped | size-limit in CI |
| PB02 | App route first load JavaScript | 200 KB gzipped | size-limit in CI |
| PB03 | Largest Contentful Paint | Under 2.5s at 75th percentile on mobile | Search Console and Vercel analytics |
| PB04 | Interaction to Next Paint | Under 200ms | As above |
| PB05 | Cumulative Layout Shift | Under 0.1 | As above |
| PB06 | Lighthouse mobile performance | 90 or above on key pages | Lighthouse CI |
| PB07 | Below the fold interactive sections | Lazy loaded with next/dynamic | Code review |
| PB08 | Fonts | Three families, subset, self hosted, preloaded | next/font |

## AI assisted build rules (CLAUDE.md and AGENTS.md)

| ID | When | Rule |
| --- | --- | --- |
| AR01 | Before building UI | Search packages/ui and Storybook for an existing component and use it. |
| AR02 | New component | Create it in packages/ui with stories and tests first, then use it in the page. |
| AR03 | Size | Never exceed 300 lines. Split the file before adding to it. |
| AR04 | Maths | Never reimplement bid maths. Import from packages/calc. |
| AR05 | Words | Never type disclaimer text. Import from packages/content. |
| AR06 | Styling | Tokens only. No hex values or arbitrary Tailwind values. |
| AR07 | Client code | Add use client only to the smallest interactive component that needs it. |
| AR08 | Mobile | Write mobile styles first and check the story at 375px before 1440px. |
| AR09 | Checks | Run lint, type check, unit tests and Storybook tests before finishing a task. |
