# Roadmap

Phase 1 is the internal MVP. Build starts only after workbook sign off.

Source: MaxBid Project Workbook, tab 23 Roadmap.

| Phase | Timing | Milestone | Deliverables | Exit criteria |
| --- | --- | --- | --- | --- |
| Phase 0 | Week 0 | Design sign off | Review this workbook, close open items, apply for eBay Marketplace Insights, confirm service accounts | Signed off workbook |
| Phase 1 | Week 1 | Foundations | Turborepo monorepo, lint limits, CLAUDE.md and AGENTS.md, packages for tokens, calc and content, Storybook with core primitives, Supabase schema and migrations, auth, organisations, roles, RLS with tests, app shell, manifest. Holding page with waitlist live on the root domain | Signed in user in an organisation. Waitlist collecting emails |
| Phase 1 | Week 2 | Ingestion | Grays extractor, PDF upload and parsing, lot normalisation, premium terms parsing, job runner setup | Grays and PDF catalogues extracted |
| Phase 1 | Week 3 | Triage engine | Pickles and Lloyds extractors, triage identification and rough valuation, opportunity score, email on completion | Ranked triage for all three sources |
| Phase 1 | Week 4 | Triage interface | Triage table, filters, shortlist, credit preview, progress screen | User can shortlist lots |
| Phase 1 | Week 5 | Deep analysis | Vision identification, confirmation and editing, comparable search across sources, match grading | Evidence panel populated |
| Phase 1 | Week 6 | Valuation and calculator | Weighting, scenarios, confidence, bid limits, slider, cost lines, cost profiles, GST engine with unit tests matching docs/02-specs/bid-calculation.md | Bid limits correct to the cent |
| Phase 1 | Week 7 | After analysis | Transport estimate, watchlist, closing alerts, outcome recording, PDF bid sheet, CSV, mobile bid view | Full journey usable |
| Phase 1 | Week 8 | Hardening and live use | Cost logging review, error handling, test on real auctions, record outcomes, fix accuracy issues | Internal MVP in use |
| Phase 2 | Month 3 | Marketing site | Full marketing site from tab 34, try before sign up, onboarding flow, schema, sitemaps, Search Console and Bing Webmaster Tools, Auction Breakdown template, first four breakdowns published | Site live and indexed |
| Phase 2 | Month 4 | Commercial launch | Stripe billing, credits, free tier, founding member offer to waitlist, legal review, referral programme, lifecycle emails, first category rules | Paying users |
| Phase 2 | Months 4 to 6 | Value guides | Value guide template, publish threshold job, first guides for products meeting the threshold, internal linking | Guides indexed and ranking |
| Phase 3 | Month 5 onward | Growth | More auction sources, saved search alerts, margin dashboard, pooled outcomes, partnerships | Expanded product |


# Success Metrics

Measured during internal use before commercial launch. Targets are proposed and editable.

Source: MaxBid Project Workbook, tab 24 Metrics.

| Metric | Definition | Target |
| --- | --- | --- |
| Extraction completeness | Lots extracted correctly as a share of lots in the catalogue | 0.98 |
| Identification accuracy | Deep identifications confirmed without edit | 0.8 |
| Valuation accuracy | Actual resale within 15 percent of expected resale | 0.7 |
| Conservative reliability | Actual resale at or above conservative resale | 0.85 |
| Triage time | Minutes from submission to triage email for 300 lots | 10 |
| Deep analysis time | Minutes per shortlisted lot | 2 |
| Cost per catalogue | Total AUD cost for a 300 lot catalogue at 10 percent shortlist | 25 |
| Profit on target | Won lots achieving at least the target profit | 0.7 |
| Waitlist sign ups | Emails collected before public launch | 500 |
| Visitor to sign up | Share of homepage visitors who create an account | 0.05 |
| Time to first value | Minutes from sign up to first triage result | 5 |
| Activation | New accounts completing a deep analysis within 7 days | 0.4 |
| Month 3 retention | Paying organisations still active after three months | 0.6 |
| Organic share | Share of new sign ups from organic search and AI answers | 0.4 |
| Value guides indexed | Published guides indexed by Google 90 days after launch | 0.8 |
| AI citations | Monthly count of AI answer citations found in tracked prompts | 20 |
| Referral share | Share of new paying organisations from referrals | 0.15 |
| Core Web Vitals | Share of public URLs rated Good in Search Console | 0.9 |
