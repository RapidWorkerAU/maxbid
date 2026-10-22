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
| 6 | W1.1 Button, StopLine and Wordmark to In review | Merged | 22 Sep 2026 |
| 7 | W1.2 Primitives A: Input, Toggle group, Money, MonoLabel, ProvenanceTag | Merged | 22 Sep 2026 |
| 8 | W1.3 Primitives B: AiLabel, MatchBadge, ConfidenceBadge, ZoneLabel, InfoNote | Merged | 22 Sep 2026 |
| 9 | W1.4 Primitives C: SheetFrame, TitleBlock, DetailLabel, LeaderLine, LineIcon | Merged | 22 Sep 2026 |
| 10 | W1.5 First migration and row level security | Merged | 22 Sep 2026 |
| 11 | All 18 primitives Approved, and W1.6 sign in, organisations, terms, AppShell | Merged | 22 Sep 2026 |
| 12 | W1.7 Waitlist holding page | Merged | 23 Sep 2026 |
| 13 | W2.3 Ingestion schema, auctions, lots and analyses | Merged | 23 Sep 2026 |
| 14 | O05 site access findings and decision record 0012 | Merged | 23 Sep 2026 |
| 22 | Diagnosable errors, the Grays card layout, and never reading a cached page | Merged | 29 Sep 2026 |
| 23 | The buyer's premium is a schedule, not a single rate | Merged | 29 Sep 2026 |
| 24 | Store the premium as a schedule, and read it from the auction | Merged | 29 Sep 2026 |
| 26 | Tables for triage, and for what every AI call costs | Merged | 29 Sep 2026 |
| 27 | S4 identifies every lot, with a ceiling on what it may spend | Merged | 29 Sep 2026 |
| 29 | The evidence tables, and a row per lot in every analysis | Merged | 29 Sep 2026 |
| 31 | LotRow and TriageTable | Merged | 29 Sep 2026 |
| 32 | Show the lots on the analysis page | Merged | 29 Sep 2026 |
| 33 | S5 values a lot, and finds out what the evidence is really worth | Merged | 29 Sep 2026 |
| 34 | Value against real auction results, and start our own archive | Merged | 29 Sep 2026 |
| 35 | Run the harvest on its own, and give a sale a closing time | Merged | 29 Sep 2026 |
| 36 | Show what each lot is worth, and make S5 a stage that runs | Merged | 29 Sep 2026 |
| 37 | A new organisation starts with a cost profile and nothing in it | Merged | 29 Sep 2026 |
| 38 | Stay inside what the extraction service allows per minute | Merged | 29 Sep 2026 |
| 39 | Rank a catalogue on what a lot is worth, not on the current bid | Merged | 29 Sep 2026 |
| 40 | Rank the list, and show the most you should bid | Merged | 29 Sep 2026 |
| 41 | Value the lots worth valuing, not every lot | Merged | 30 Sep 2026 |
| 42 | Bring the progress log up to date, including what it got wrong | Merged | 30 Sep 2026 |
| 43 | Read a premium that is the same at every price | Merged | 30 Sep 2026 |
| 44 | Apply the usage rule only where usage is a thing the lot has | Merged | 30 Sep 2026 |
| 45 | State a fact about the user's figures, not a verdict on a lot | Merged | 30 Sep 2026 |
| 46 | Read our own archive before searching the web for it | Merged | 30 Sep 2026 |
| 47 | Stop a lot being evidence about itself | Merged | 30 Sep 2026 |
| 48 | Catalogues are ready before anybody asks for them, decision record 0024 | Merged | 13 Oct 2026 |
| 49 | Put what a lot is and what it is worth where everybody can read them | Merged | 22 Oct 2026 |
| 50 | Record what actually happened, because nothing else can tell us | Merged | 22 Oct 2026 |
| 51 | Read what we already know before working it out again | Merged | 22 Oct 2026 |
| 52 | Identify a lot once, for everybody | Merged | 22 Oct 2026 |
| 53 | Say when we last checked the bids | Merged | 22 Oct 2026 |
| 54 | Value only the lots this analysis covers | Merged | 22 Oct 2026 |
| 55 | Re-read a current bid as often as it needs it | Merged | 22 Oct 2026 |
| 56 | Remember a lot we could not value | Merged | 22 Oct 2026 |
| 58 | The lot detail screen, which shows the working | Open | |
| next | Read the sitemaps nightly and queue the sales nobody has asked about | Next |  |

**Where we are.** The pipeline runs end to end on a real sale: a pasted Grays link becomes 36 identified lots with a premium schedule, resale ranges, bid figures and a ranking, all on screen. The archive holds what all 36 lots actually sold for. Decision record 0024's shared layer is now built on top of that, so the work that does not depend on who is asking is done once and read by everybody.

**What the measurement said.** Twenty two lots were valued and every one of them sold, so the figures can be checked. The median maximum bid was 0.71 times what the lot fetched, which is the safe direction, and one lot came out at 3.93 times, which is not. The error is in the resale estimates rather than the bid maths: two lots were estimated at 2.8 and 3.5 times what they fetched at auction, and one at 0.7. **MaxBid is not yet accurate enough to bid on**, and saying so is more useful than the figures look.

**Why, and what fixes it.** Almost every comparable is an advertised price weighted 0.6, where a sold price is weighted 0.95. The archive has one sale in it. Accuracy is a function of how many sales have been harvested, so it improves over weeks rather than in a sitting. Decision records 0020 and 0021 set that up deliberately, and 0024 fills the archive faster by reading every live sale rather than only the ones somebody asked about.

**What was built on 22 October.** Eight pull requests, 49 to 56, which together are decision record 0024 minus the crawler itself.

1. Identifications and resale ranges moved from the analysis to the lot, with a per organisation override for a correction. A second person analysing the same sale now waits for arithmetic rather than for forty minutes of page fetches.
2. Decision record 0025 settled when a stored range is reused: while the method version matches, whatever its age.
3. Decision record 0026, set by Ashleigh, re-reads a current bid on a tier set by how long the sale has left, from every ten minutes inside two hours to every two hours beyond forty eight. One catalogue fetch returns every bid in a sale, which is what makes this cost per sale where valuation costs per lot.
4. Decision record 0027 remembers a lot we could not value, so the same lot is not re-attempted nightly for an answer that has not changed.
5. The outcomes table from pull request 50, written on 1 October and never opened as a pull request until now.

**What that work found.** Four things no test was asking for. The confidence score was a fixed guess, so every valued lot was weighted identically and the ranking came down to the bid figure alone. A `Map` cannot cross an Inngest step boundary, which would have made the whole saving silently never happen. Skipping identified lots stopped the valuation stage starting at all on a sale where every lot was already known, which is the exact case the work exists to make fast. And the refusal tests on the outcomes table were passing for the wrong reason: every one of them would have passed with every check in the migration deleted.

**Not yet verified against a real sale.** S4 and S5 were restructured substantially across these eight pull requests. Everything is green and unit tested, and none of it has run against a live catalogue. Every pipeline change of this size so far has exposed something the tests could not see: the flat premium, the usage cap on lots with no odometer, the dropped odometer itself. One real catalogue through the whole pipeline is worth more than the next feature, and it is worth doing before the crawler rather than after.

**Blocked and waiting on Ashleigh.** Six migrations are written and not pushed: outcomes, shared valuations, bid_checked_at and valuation_attempts. Nothing above is live until `pnpm db:push` runs. O04, the eBay Marketplace Insights application, is still worth making because approval takes time. O11 blocks promoting the waitlist page. LotRow is In review and needs a Storybook sign off before another page uses it. The app has never been deployed: there is no Vercel project for apps/app and maxbid.com.au still points at a placeholder.

**Open items raised by building.** O17, a catalogue page cut short cannot be detected. O18, a premium band that combines a fixed amount with a percentage, or carries a minimum. O20, the per page cost of re-reading bids against the extraction plan's limits. O19 is closed by decision record 0027.

**A rule that has to be kept by hand.** Decision record 0025 reuses a stored resale range while `VALUATION_METHOD_VERSION` matches. **Bump that string whenever the valuation method changes what the answer would be.** Nothing detects a forgotten bump, and the consequence is that an accuracy fix does not reach any lot already valued. Decision record 0027 reads the same string, so a bump also gives every lot that failed a valuation another look.

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
| W2.1 | Inngest client, S1 ingest, platform detection. Closes O01 | D32, pipeline.md, decision record 0013 | M | a |
| W2.2 | Firecrawl, robots.txt and the site access rules. Closes O02 | D34, site-access.md, decision record 0014 | M | a |
| W2.3 | Migration: auction_platforms, auctions, lots, lot_images, analyses, analysis_lots, raw extract | database.md, security-and-rls.md shared tables | L | a |
| W2.4 | Ingest and extract stages S1 and S2 for Grays | F05, F07, S1, S2. Cleared by docs/02-specs/site-access.md | L | a |
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
