# Risk Register

Likelihood and impact scored 1 to 5. Rating is a formula.

Source: MaxBid Project Workbook, tab 22 Risks.

| ID | Category | Risk | Likelihood | Impact | Rating | Mitigation |
| --- | --- | --- | --- | --- | --- | --- |
| R01 | Technical | Auction site structure changes break an extractor | 4 | 3 | 12 | Extractor health checks, admin alerts, PDF fallback, versioned extractors |
| R02 | Technical | Auction site blocks automated access | 3 | 4 | 12 | Managed extraction, rate limits, compliance with terms, partnership approach later |
| R03 | Data | Sold price data is hard to obtain | 4 | 4 | 16 | Apply for eBay Marketplace Insights early, use auction realised results, build internal outcomes |
| R04 | Accuracy | Wrong identification leads to a wrong value | 3 | 5 | 15 | Vision on plates, mandatory user confirmation, confidence scoring, evidence visible |
| R05 | Accuracy | Weak comparables in broad categories | 4 | 4 | 16 | Honest match levels, insufficient evidence state, category rules added progressively |
| R06 | Commercial | User overbids and blames the platform | 3 | 4 | 12 | Conservative default, stop line, disclaimers, decision support positioning |
| R07 | Commercial | Cost per catalogue exceeds pricing | 2 | 4 | 8 | Two stage triage, cost logging per job, credit model, caching |
| R08 | Legal | Breach of third party terms or copyright | 2 | 5 | 10 | No copied images, respect terms, legal review before launch |
| R09 | Delivery | Build time competes with consulting workload | 4 | 3 | 12 | Tight V1 scope, eight week plan, weekly milestones |
| R10 | Delivery | Scope creep before design sign off | 3 | 3 | 9 | Decision register controls change. No build until workbook signed off. |
| R11 | Security | Cross tenant data leak | 1 | 5 | 5 | RLS on all organisation tables, automated RLS tests |
| R12 | Marketing | Value guides seen as thin or duplicate content | 3 | 4 | 12 | Publish threshold, unique data per page, noindex below threshold, human review of templates |
| R13 | Marketing | Auction houses object to Auction Breakdowns | 2 | 3 | 6 | Link to their lots, no copied photos or text, frame as driving bidders to them, open partnership conversation |
| R14 | Commercial | Try before sign up abused and costs rise | 3 | 3 | 9 | Serve cached shared triage only, rate limit per IP, cap lots shown, bot protection |
| R15 | Brand | Chosen name unavailable as domain or trade mark | 3 | 4 | 12 | Check ASIC, IP Australia and domains before any design work on the logo |
| R16 | Brand | Branded search for MaxBid shows the US auction house and crypto app | 4 | 2 | 8 | Always search as MaxBid Australia in early content, Organization schema with Australian details, consistent handles, Google Business Profile, build branded mentions in AU communities |
| R17 | Brand | MaxBid refused as a trade mark for being descriptive | 3 | 3 | 9 | Search and seek advice before filing. Register the stylised logo as well as the word. Fallback names on tab 21 |
| R18 | Delivery | Components duplicated or files grow out of control during fast AI assisted builds | 4 | 3 | 12 | Library first rule in CLAUDE.md and AGENTS.md, lint caps fail CI, Storybook review before pages, monthly duplication check |
| R19 | UX | Desktop polish drifts ahead of mobile or the reverse | 3 | 3 | 9 | Every story and test runs at 375px and 1440px, usability rounds on real phones |
| R20 | Design | Marker yellow confused with the amber warning colour | 2 | 3 | 6 | Yellow only for actions and the bid figure, amber only for warnings with a text label, contrast tests in CI |


# Open Items

Items to close before or during Phase 0.

Source: MaxBid Project Workbook, tab 25 Open Items.

| ID | Item | How to close | Owner | When |
| --- | --- | --- | --- | --- |
| O01 | Choose between Inngest and Trigger.dev | Build a small spike of the fan out pattern on each | Ashleigh | Phase 0 |
| O02 | Choose between Firecrawl and Browserbase | Test both on one catalogue from each auction house | Ashleigh | Phase 0 |
| O03 | Choose between Brave Search API and SerpAPI | Compare result quality on 20 sample lots | Ashleigh | Phase 0 |
| O04 | Apply for eBay Marketplace Insights access | Submit application through the eBay developer program | Ashleigh | Phase 0 |
| O05 | Review Grays, Pickles and Lloyds terms of use | Read terms and record any restrictions on automated access | Ashleigh | Phase 0 |
| O06 | Which categories get specific rules first | Rank by what we buy most and where generic matching is weakest | Ashleigh and Jason | Phase 1 |
| O07 | Calibrate matching and confidence weights | Compare against recorded outcomes after the first 30 won lots | Ashleigh | Phase 1 |
| O08 | Product name | Closed. MaxBid selected | Ashleigh and Jason | Closed |
| O09 | Validate pricing tiers | Interview five resellers and test willingness to pay | Ashleigh | Phase 2 |
| O10 | Legal review of terms and disclaimers | Engage a lawyer before public launch | Ashleigh | Phase 2 |
| O11 | Secure MaxBid | Register maxbid.com.au under an ABN, search IP Australia for MaxBid in classes 9, 35 and 42, register the business name with ASIC, reserve social handles. Needed before the Week 1 holding page | Ashleigh and Jason | Phase 0 |
| O12 | Logo design | Wordmark and stop line mark from tab 32 direction | Ashleigh | Phase 1 |
| O13 | Verify AI crawler user agents | Confirm current names on each provider's documentation before writing robots.txt | Ashleigh | Phase 2 |
| O14 | Set founding member offer | Decide discount, duration and cap | Ashleigh and Jason | Phase 2 |
| O15 | Choose AI citation tracking method | Manual monthly prompt checks or a monitoring tool | Ashleigh | Phase 2 |
| O16 | Choose visual regression tool | Chromatic or Playwright screenshots, based on cost and workflow | Ashleigh | Phase 1 |
