# Build plan

Every pull request from here to the internal MVP, in order. Built from docs/04-build/roadmap.md weeks 1 to 8, the Phase 1 Must features in docs/02-specs/features.md, and the component register.

## Progress log

Updated at the end of every pull request. The current row is always the one to read.

| Pull request | Title | Status | Merged |
| --- | --- | --- | --- |
| 1 | Close the documentation conflicts found in orientation | Merged | 22 Sep 2026 |
| 2 | Rename the bid figures and add the position and rounding maths | Merged | 22 Sep 2026 |
| 3 | Add the quality gates that the rule book assumes | Merged | 22 Sep 2026 |
| 4 | Complete the token set and fix two accessibility failures | Merged | 22 Sep 2026 |
| 5 | This build plan | Merged | 22 Sep 2026 |
| 6 | W1.1 Button, StopLine and Wordmark to In review | In review |  |
| 7 | W1.2 Primitives A: Input, Toggle group, Money, MonoLabel, ProvenanceTag | In review |  |
| 8 | W1.3 Primitives B: AiLabel, MatchBadge, ConfidenceBadge, ZoneLabel, InfoNote | In review |  |
| 9 | W1.4 Primitives C: SheetFrame, TitleBlock, DetailLabel, LeaderLine, LineIcon | In review |  |
| 10 | W1.5 First migration and row level security | Merged | 22 Sep 2026 |
| 11 | All 18 primitives Approved, and W1.6 sign in, organisations, terms, AppShell | In review |  |
| 12 | W1.7 Waitlist holding page | In review |  |
| 13 | W2.3 Ingestion schema, auctions, lots and analyses | In review |  |
| 14 | O05 site access findings and decision record 0012 | In review |  |
| 15 | W6.1 The valuation maths | Next |  |

**Where we are.** Week 1 is built. All 18 primitives are Approved. The database, row level security, accounts, the terms gate, the app shell and the waitlist page are all in. Week 2 cannot start until O01, O02 and O05 are closed, which are all Ashleigh tasks.

**Blocked and waiting on Ashleigh.** O05 is part closed. Lloyds is cleared, Pickles is prohibited and out of V1, and the Grays terms still need reading in a browser. Inngest and Firecrawl are chosen but need accounts. O03 blocks Week 3. O04 should be applied for now because approval takes time. O11 blocks promoting the waitlist page.

## How to read this

**Size.** S is under an hour. M is one sitting. L needs splitting if it grows.

**Checkpoint.** Every pull request ends at **e**, merge. These are the extra stops.

| Code | Meaning |
| --- | --- |
| a | Plan first. Touches packages/calc, the database, row level security, authentication or an external service |
| b | Sign off. Components or screens to review in Storybook or on the Vercel preview |
| c | Decision. A spec gap, conflict or new decision, proposed as a decision record |
| d | Only Ashleigh. Accounts, keys, money, hosted database, domain or legal |
| e | Merge. Every pull request. Green checks, a one paragraph summary, then merge on the word |

**Rules that apply to every row.** Library first. New components in packages/ui with stories and tests before any page uses them. Only Approved components in pages. Bid maths from @maxbid/calc, disclaimer text from @maxbid/content, colour and spacing from @maxbid/tokens. Mobile first from 360px, reviewed from 375px. 300 line cap, 80 for pages and functions. `pnpm check` before finishing.

---

## Week 1. Foundations

Exit criteria: a signed in user inside an organisation, and a waitlist collecting emails.

| ID | Title | Specs | Size | Checkpoint |
| --- | --- | --- | --- | --- |
| W1.1 | Button, StopLine and Wordmark to In review. Button gains ghost, danger and loading states | UI01, UI12, UI18. architecture.md component file pattern | M | b |
| W1.2 | Primitives A: Input, Toggle group, Money, MonoLabel, ProvenanceTag | UI02 to UI06. design-system.md. F55 | M | b |
| W1.3 | Primitives B: AiLabel, MatchBadge, ConfidenceBadge, ZoneLabel, InfoNote | UI07 to UI11. matching-and-valuation.md match levels and confidence bands. F56 | M | b |
| W1.4 | Primitives C: SheetFrame, TitleBlock, DetailLabel, LeaderLine, LineIcon | UI13 to UI17. design-system.md B01 to B07 | M | b |
| W1.5 | First migration: organisations, profiles, members, cost profiles, settings, terms. Row level security with cross organisation tests | database.md, security-and-rls.md, configuration.md CS24 to CS42. F02, F03, F04 | L | a |
| W1.6 | Sign in, organisation creation, terms acceptance, AppShell, web app manifest | F01, F02, F66. SC01, SC13, SC16. UI47. MF06 | L | a, b |
| W1.7 | Waitlist holding page with EmailCapture | F78, D105. UI35. waitlist_signups | M | b, d |

Splitting the primitives into three groups of five keeps each review to one sitting. W1.5 is the first migration, so it sets the pattern every later migration follows: tables, then policies, then functions, each in its own file under the 300 line cap.

## Week 2. Ingestion

Exit criteria: Grays and PDF catalogues extracted.

| ID | Title | Specs | Size | Checkpoint |
| --- | --- | --- | --- | --- |
| W2.1 | Choose the job runner and build the fan out spike. Closes O01 | D32, pipeline.md, tech-stack.md | M | a, c, d |
| W2.2 | Choose the extraction service. Closes O02 | D34, data-sources.md | M | a, c, d |
| W2.3 | Migration: auction_platforms, auctions, lots, lot_images, analyses, analysis_lots, raw extract | database.md, security-and-rls.md shared tables | L | a |
| W2.4 | Ingest and extract stages S1 and S2 for Grays | F05, F07, S1, S2. Needs the Grays terms read first, see decision record 0012 | L | a, d |
| W2.5 | PDF upload and parsing with OCR fallback | F06, S2. Storage buckets in security-and-rls.md | L | a, d |
| W2.6 | Normalise stage S3: lot records, premium terms parsing, platform default fallback | F10, S3. D25. DS12 | M | a |

W2.1 and W2.2 close two open items that have blocked Phase 0 since the workbook. Both need a spike, a decision record and an account.

## Week 3. Triage engine

Exit criteria: a ranked triage for all three sources.

| ID | Title | Specs | Size | Checkpoint |
| --- | --- | --- | --- | --- |
| ~~W3.1~~ | Pickles extractor. **Removed from V1** by decision record 0012. Pickles prohibits automated access | F08, now Phase 2 | n/a | Blocked |
| W3.2 | Lloyds extractor | F09, S2. Cleared by docs/02-specs/site-access.md | M | a |
| W3.3 | Triage identification stage S4 | F13, S4. D33 smaller model. ai_runs logging | L | a, d |
| W3.4 | Choose the web search API and build triage valuation stage S5. Closes O03 | F14, S5, D35. data-sources.md | L | a, c, d |
| W3.5 | Opportunity score and rank and notify stage S6, with the triage email | F15, F12, S6. Decision record 0006. Resend | M | a, d |

The opportunity score is scaled against the best lot in the catalogue, so it is computed once at S6 rather than per lot. Decision record 0006 already settles the formula.

## Week 4. Triage interface

Exit criteria: the user can shortlist lots.

| ID | Title | Specs | Size | Checkpoint |
| --- | --- | --- | --- | --- |
| W4.1 | Composites: LotRow, TimeRemainingBar, StatusLine | UI33, UI27, UI34. MF04 tables become stacked rows | M | b |
| W4.2 | TriageTable section with filters | F16, UI48, SC05. D18. TanStack Table | L | b |
| W4.3 | Credit ledger migration, shortlist and credit preview | F17, S7. credit_ledger, security definer function | L | a |
| W4.4 | Analysis progress screen | F12, SC04. ux-standards.md loading and partial results | M | b |
| W4.5 | New analysis screen and dashboard | F05, SC02, SC03 | M | b |

## Week 5. Deep analysis

Exit criteria: the evidence panel populated.

| ID | Title | Specs | Size | Checkpoint |
| --- | --- | --- | --- | --- |
| W5.1 | Migration: products, aliases, identifications, comparables, snapshots, lot_comparables, spec fields, ai_runs, usage_events | database.md, security-and-rls.md match table and private comparables | L | a |
| W5.2 | Vision identification stage S8, with confirm and edit | F18, F19, S8. D10, D11. DS13, DS14 | L | a, d |
| W5.3 | Enrichment stage S8A, source classes and the spec sheet | F71 to F76, S8A. transparency.md source classes. DS23 to DS25, DS34. UI24, UI25, SC06A | L | a, b |
| W5.4 | Comparable search stage S9 across eBay, search, internal history | F20, F22, F23, S9. data-sources.md. O04 affects sold data | L | a, d |
| W5.5 | Match grading stage S10 and the evidence panel | F21, S10, SC07. UI22, UI23. DS08, DS26, DS33 | L | a, b |

## Week 6. Valuation and calculator

Exit criteria: bid limits correct to the cent, in the product rather than only in tests.

| ID | Title | Specs | Size | Checkpoint |
| --- | --- | --- | --- | --- |
| W6.1 | packages/calc: evidence weighting, recency decay, scenarios, confidence score | F24, F25, F26. matching-and-valuation.md. CS04 to CS10 | L | a |
| W6.2 | Valuation stage S11, the valuations table and method versioning | F67, S11. governance.md. method_versions | M | a |
| W6.3 | Settings resolution engine and organisation locks, enforced in the database | F51, F52, F53, F54. configuration.md precedence and lock rules | L | a |
| W6.4 | Cost profiles and the costs and bids stage S12 | F30, F33, F34, S12. cost-fields.md. Decision record 0005 | L | a |
| W6.5 | Calculator composites: CostSummary, BidLimits, BidRail, BidSlider, OverrideMarker, ChangesSummary | UI19, UI20, UI21, UI31, UI32, UI51. F29, F31, F59. DS04 to DS07, DS10, DS15 | L | b |
| W6.6 | Lot detail screen and the calculator panel | SC06, SC08. UI49. F63 soft warnings. configuration.md situation responses | L | b |

W6.1 and W6.3 are the two riskiest in the plan. The first puts numbers in front of a user for the first time, the second is enforced in the database rather than the interface, so it needs its own tests.

## Week 7. After analysis

Exit criteria: the full journey usable, end to end, on a phone.

| ID | Title | Specs | Size | Checkpoint |
| --- | --- | --- | --- | --- |
| W7.1 | Transport estimate and the routing API | F34, D27. DS11 | M | a, d |
| W7.2 | Watchlist, and closing alerts at stage S15 | F35, F36, S15, SC09. DS32 | L | a |
| W7.3 | Outcome recording | F37, D28, SC11. outcomes table | M | a |
| W7.4 | PDF bid sheet and CSV export | F38, F39. DS16. React PDF. Exports bucket | L | a |
| W7.5 | Mobile bid view, installable app and the offline cache | F40, F91, F92, F93, SC10. UI50. MF05 to MF07. DS31 | L | b, d |
| W7.6 | Transparency panels: searched and not found, cannot verify, report a problem | F57, F58, F64. UI52, UI53, UI54. DS29, DS30 | M | b |

## Week 8. Hardening and live use

Exit criteria: the internal MVP in use on real auctions.

| ID | Title | Specs | Size | Checkpoint |
| --- | --- | --- | --- | --- |
| W8.1 | Governance: correction review queue, problem reports, public changelog | F65, F68, F69, F76. governance.md | L | a |
| W8.2 | Platform admin: settings, extractor health, cost per job | F41, F42, F69, SC15. CS16 to CS23 | L | a |
| W8.3 | Onboarding: three step setup and the guided first analysis | F84, F85, SC16. ux-standards.md onboarding | M | b |
| W8.4 | Hardening: error handling, retries and refunds, end to end tests | ux-standards.md errors and partial results. R01. Playwright | L | a |
| W8.5 | First real catalogue run, outcomes recorded, accuracy reviewed | Success metrics in roadmap.md. O07 | M | d |

W8.5 is not a code change. It is the run that decides whether the MVP works, and it needs a real auction.

---

## Things only Ashleigh can do

Ordered by when they block work. Nothing in this column can be done by Claude Code.

| Item | Blocks | When |
| --- | --- | --- |
| O11. Register the domain under an ABN, IP Australia search in classes 9, 35 and 42, ASIC business name | Promoting the waitlist page | Before W1.7 ships publicly |
| O05. Read the Grays, Pickles and Lloyds terms and record any limits on automated access | W2.4, W3.1, W3.2 | Before Week 2 |
| O01. Choose Inngest or Trigger.dev, and create the account | W2.1 and everything after it | Week 2 |
| O02. Choose Firecrawl or Browserbase, and create the account | W2.2 and every extractor | Week 2 |
| Supabase hosted project and keys | W1.5 onward runs locally, but the hosted project is needed to deploy | Week 2 |
| Anthropic API key | W3.3 and every AI stage | Week 3 |
| O03. Choose Brave or SerpAPI, and create the account | W3.4 | Week 3 |
| Resend account for transactional email | W3.5 | Week 3 |
| O04. Apply for eBay Marketplace Insights. Approval is slow, so apply early | W5.4 sold data quality | Apply in Week 2 |
| eBay Browse API keys | W5.4 | Week 5 |
| Routing API key, Google Routes or Mapbox | W7.1 | Week 7 |
| O16. Choose Chromatic or Playwright screenshots for visual regression | C10 visual snapshots | Any time in Phase 1 |
| O12. Logo design | Nothing. The Wordmark primitive covers the interim | Any time |
| O06, O07. Category rules and weight calibration | Nothing. Both need real outcome data first | Week 8 |

## What this plan does not cover

Phase 2 and later. The marketing site, Stripe billing, credits and free tier limits, value guides, Auction Breakdown pages, referrals and lifecycle email are all Phase 2 in features.md and roadmap.md. They come after the internal MVP is in use.
