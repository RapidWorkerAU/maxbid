# Decision Register

Every decision from the discovery session. Change decisions here first.

Source: MaxBid Project Workbook, tab 02 Decisions.

| ID | Area | Question | Decision | Followed recommendation | Rationale and implications |
| --- | --- | --- | --- | --- | --- |
| D01 | Strategy | Primary goal | Build for us first, commercialise once proven | Yes | Proves accuracy on real money before selling it. Keeps early costs low. |
| D02 | Strategy | V1 market | All auction categories | No | Broader appeal. Requires a category agnostic engine and progressive category rules. Accuracy will vary by category and must be shown honestly. |
| D03 | Strategy | Primary paying user | Resellers and flippers buying for profit | n/a | Profit maths and bid limits are the core of the product. |
| D04 | Input | Auction sources in V1 | Grays, Pickles and Lloyds | Yes | Three structured, high volume sources. Each needs its own extractor. |
| D05 | Input | Submission method | URL plus PDF catalogue upload | Yes | PDF upload covers any auctioneer not yet supported. |
| D06 | Input | Geographic scope | Australia only | Yes | Consistent currency, GST, freight and comparables. |
| D07 | Data | Comparable price gathering | eBay API, web search API and retailer sites | Yes | Uses official APIs where possible and limits scraping risk. |
| D08 | Data | Sold versus advertised weighting | Sold prices weighted highest, advertised as support | Yes | Sold prices are evidence of what buyers actually pay. |
| D09 | Data | Pricing freshness | Live on each analysis, cached for seven days | Yes | All comparables are also stored permanently for the evidence trail, which builds a historical database at no extra cost. |
| D10 | Identification | Lot identification method | Text plus AI vision on lot photos | Yes | Model numbers are often only visible on plates in photos. |
| D11 | Identification | User correction | Always let the user confirm or edit the identification | Yes | Corrections become matching data that improves future results. |
| D12 | Identification | Explanation depth | Match level, plain English reason and differences | Yes | Full comparison table available on expand. |
| D13 | Processing | Large catalogues | Quick triage of all lots, deep analysis on shortlisted lots | Yes | Controls cost and creates a natural pricing lever. |
| D14 | Processing | Processing experience | Background job, progress bar and email when done | Yes | Users can leave and return. |
| D15 | Processing | On identification correction | Automatic instant revaluation | Yes | Consumes a credit only if a new comparable search is required. |
| D16 | Triage | Shortlisting | System ranks by opportunity, user ticks lots for deep analysis | Yes | User stays in control of spend. |
| D17 | Triage | Triage display | Estimated resale range, rough max bid and opportunity score | Yes | Enough to decide what is worth a deep look. |
| D18 | Triage | Triage filters | Category, value, location and closing time | Yes | Saved filter presets deferred to a later phase. |
| D19 | Calculator | Profit target | Dollars or percentage return on cost, chosen per lot | Yes | Different lots suit different targets. |
| D20 | Calculator | Default resale scenario | Conservative by default, switchable | Yes | Protects the user from bidding on optimism. |
| D21 | Calculator | Bid limits shown | Target bid, limit bid and break even bid | Yes | The most you should bid defaults to the target bid. Names set by decision record 0002. |
| D22 | Costs | Cost field display | Collapsed summary, expand to edit line items | Yes | Keeps the lot table readable. |
| D23 | Costs | GST handling | GST registered setting on the user profile, then automatic calculation | Yes | Shows cash required and effective cost after credits. |
| D24 | Costs | Selling fees | No automatic channel fees. User adds manually | No | A visible flag warns when selling fees are blank so the max bid is not silently inflated. |
| D25 | Costs | Buyer's premium | Extracted from each auction's terms, platform default fallback, editable | Yes | Rates vary by auction and category. |
| D26 | Costs | Default assumptions | Multiple saved cost profiles | Yes | For example Machinery, Small tools, Vehicles. |
| D27 | Costs | Transport | Distance estimate from user base to lot location, editable | Yes | Uses a routing API and a rate per km by size class from the cost profile. |
| D28 | After analysis | Outcome tracking | Won or lost, final price and actual resale | Yes | Provides verified sold data and measures our accuracy. |
| D29 | After analysis | Alerts in V1 | Closing soon alerts for watchlisted lots | Yes | Saved search alerts deferred. |
| D30 | After analysis | Exports | PDF bid sheet and CSV | Yes | Bid sheet designed to be used on a phone at the auction. |
| D31 | Tech | Core stack | Next.js, Supabase and Vercel | Yes | Matches existing skills and the HSES Online stack. |
| D32 | Tech | Background jobs | Inngest or Trigger.dev | Yes | Durable, retryable, long running steps with fan out per lot. |
| D33 | Tech | AI provider | Claude API for extraction, vision and matching | Yes | Smaller model for triage, larger model for deep analysis. |
| D34 | Tech | Auction page extraction | Managed service such as Firecrawl or Browserbase | Yes | Handles JavaScript rendering and anti bot measures without self hosting. |
| D35 | Tech | Web search | Dedicated search API such as Brave or SerpAPI | Yes | Structured, predictable results and cost. |
| D36 | Tech | Account structure | Organisation and team accounts from day one | Yes | Supports you and Jason now and dealers later. |
| D37 | Design | Device priority | Desktop first analysis with a mobile optimised bid view | Yes | Research at a desk, bid on the phone. |
| D38 | Design | Visual style | Clean, data dense trading desk feel | Yes | Numbers first, calm colours, clear status signals. |
| D39 | Design | Theme | Light pages only in V1. Dark mode is a later option | Yes | Amended by decision record 0001. |
| D40 | Commercial | Pricing model | Subscription tiers with included credits and top up packs | Yes | Predictable revenue with usage based cost control. |
| D41 | Commercial | Free entry | Free triage with limited catalogues, pay for deep analysis | Yes | Users see value before paying. |
| D42 | Commercial | Name | Suggestions provided in this workbook | Yes | Candidates are listed in docs/03-design/brand-and-writing.md. |
| D43 | Legal | Positioning | Decision support tool, not valuation advice | Yes | Clear disclaimers in the product and the terms. |
| D44 | Legal | Comparable display | Link, price, date and text summary. No copied images | Yes | Avoids copyright issues with third party photos. |
| D45 | Legal | Auction data access | Respect site terms, rate limit, public pages only | Yes | Formal partnerships considered once there is traction. |
| D46 | Delivery | Builder | Ashleigh with Claude Code and Codex | Yes |  |
| D47 | Delivery | Timeline | Internal MVP in six to eight weeks, then iterate | Yes |  |
| D48 | Delivery | Workbook format | Excel with tabs by topic | n/a | This file. |
| D49 | Configuration | Configuration layers | Platform, Organisation, User, Lot. Each lower layer overrides the one above unless locked | Yes | Resolution engine reads the lowest set value. See tab 27. |
| D50 | Configuration | Reach of a user override | That lot, in their organisation only | Yes | Overrides never change defaults or other lots. |
| D51 | Configuration | User corrections to shared data | Never applied directly. Flagged for admin review, then applied | Yes | Protects every other user from one person's error. See tab 31. |
| D52 | Configuration | Evidence weights, match levels, confidence formula | Hard coded, versioned and visible to users | Yes | Changed only by a versioned release with a public changelog. |
| D53 | Configuration | Core maths and GST rate | Hard coded, never overridable | Yes | A legislative GST change is handled by a code release. |
| D54 | Helper behaviour | User enters own resale price | Allowed. Labelled Your input with system confidence shown separately | Yes | The user may know more than the evidence. The system never presents their figure as its own. |
| D55 | Helper behaviour | Bid above the limit bid or the break even bid | Warn and let them proceed | Yes | The platform advises and never blocks a bidding decision. |
| D56 | Helper behaviour | Insufficient evidence | No system bid. User can enter own resale to calculate | Yes |  |
| D57 | Helper behaviour | Excluding comparables | Allowed with reason recorded and valuation shown before and after | Yes |  |
| D58 | Helper behaviour | User supplied comparables | Allowed. Labelled User supplied, own weight category, private to the organisation | Yes | Never shared with other organisations. |
| D59 | Helper behaviour | Overridden value display | Marker on every overridden field with one click reset to system value | Yes |  |
| D60 | Helper behaviour | Override summary | Per lot summary of what has changed from the system values | Yes |  |
| D61 | Transparency | Provenance labels | Every figure tagged Verified, Extracted, Estimated or Your input | Yes | Definitions on tab 29. |
| D62 | Transparency | Negative evidence | List sources searched and what was not found | Yes |  |
| D63 | Transparency | Data age | Date checked on every price with a stale warning after seven days | Yes |  |
| D64 | Transparency | AI content | All AI generated content labelled as AI generated | Yes | Identifications, match reasons and summaries. |
| D65 | Transparency | Unverifiable items | Fixed We cannot verify panel on every lot | Yes | Category specific items added to the general list. |
| D66 | Transparency | Method explanation | How this was calculated expander on every bid limit | Yes |  |
| D67 | Disclaimers | Terms acceptance | Clickwrap at sign up, versioned, re acceptance on material change | Yes | Acceptance recorded with version and timestamp. |
| D68 | Disclaimers | In product disclaimers | Short contextual notes where the risk is, full text one tap away | Yes | Avoids banner blindness. Library on tab 30. |
| D69 | Disclaimers | Export disclaimers | Footer disclaimer, source tags and analysis date on every export | Yes |  |
| D70 | Organisation | Setting locks | Org admins can lock chosen defaults for members | Yes | Lock types are Fixed or Floor. |
| D71 | Organisation | Visibility of team overrides | Visible to everyone in the organisation | Yes |  |
| D72 | Organisation | Audit history | Organisation wide history of who changed what and when | Yes |  |
| D73 | Governance | New method versions | Keep old results, show newer method available, user chooses to recalculate | Yes | Past decisions remain reproducible. |
| D74 | Governance | Method changelog | Public changelog of method and data source changes | Yes |  |
| D75 | Governance | Platform defaults | Admin editable with change log, no deploy needed | Yes | Premium fallbacks, asking discounts, category lists. |
| D76 | Governance | Reporting wrong data | Report a problem on every lot, identification and comparable | Yes | Feeds the correction review queue. |
| D77 | Governance | Accuracy track record | Published by category once enough outcomes exist | Yes | Minimum sample rule on tab 31. |
| D78 | Governance | Tone of warnings and disclaimers | Plain, factual and neutral. States the risk and the reason | Yes |  |
| D79 | Enrichment | Fill in missing lot details | Yes. Enrich lots with verifiable specifications where the item can be identified | n/a | Adds value beyond valuation. Spec sheet rules on tab 29. |
| D80 | Enrichment | Separation of specification sources | Model specifications, Observed on this lot, Auctioneer stated and Not verified are always kept separate | n/a | Manufacturer data describes the model, not the specific unit at auction. |
| D81 | Enrichment | Unidentifiable lots | No guessing. Lot marked Not identified. User can enter the model to trigger enrichment | n/a | User entered model is tagged Your input. |
| D82 | Enrichment | When enrichment runs | Deep analysis only, included in the credit | Yes | Enrichment also improves comparable matching, so it runs before comparable search. |
| D83 | Enrichment | Conflicting information | Show both values side by side and flag the conflict | Yes | The platform does not decide which source is right. |
| D84 | Enrichment | Spec sheet delivery | Section on lot detail plus downloadable PDF spec sheet | Yes |  |
| D85 | Disclaimers | Disclaimer coverage | Subtle contextual notes on every screen, element, notification and export that shows an estimate or third party data | n/a | Coverage map and style rules on tab 30. |
| D86 | Disclaimers | Recommendation wording | One standard phrase: We recommend independent checks before bidding | n/a | Used word for word wherever a check is recommended. |
| D87 | Disclaimers | Unverified details | Listed as Not verified and never presented as fact, rather than left out | n/a | Shows the buyer what to ask the auctioneer. |
| D88 | Website | Site structure | Marketing site at root domain, app at app subdomain, one Next.js codebase | Yes | App subdomain is noindex. Shared design tokens and components. |
| D89 | Website | Programmatic value guides | Public price guide pages from our own aggregated data, phase 2 | Yes | Largest SEO lever. Publish threshold on tab 35. |
| D90 | Website | AI crawler policy | Allow AI search and answer crawlers, block training crawlers | Yes | Trade off noted on tab 36. |
| D91 | Brand | Personality | Sharp insider: confident, dry wit, plain speaking, on the buyer's side | Yes |  |
| D92 | Brand | Where character lives | Blueprint visual details with plain trustworthy copy | n/a | Drawing sheet frames, title blocks, detail labels, leader dots and measurement lines. Replaces the earlier edgy direction. |
| D93 | Brand | Default theme | Light pages with navy blueprint headers and panels | n/a | Replaces dark first. A dark mode for the app is a later option. |
| D94 | Brand | Colour palette | Blueprint: navy, drafting white, line cyan, marker yellow and pen blue | n/a | Replaces lime. Yellow is kept for primary actions and the most you should bid figure, never for status. |
| D95 | Brand | Typography | Barlow for headings and body, Space Mono for labels and data | n/a | Replaces Space Grotesk, Inter and JetBrains Mono. |
| D96 | Design | Visual direction | Blueprint, based on engineering drawings | n/a | Chosen after comparing twelve options in the MaxBid design canvas. |
| D97 | Design | Homepage sections | Drawing sheet header with search tabs, detail cards, icon tiles, closing list with time remaining, split bar and framed navy sign up | n/a | Picked section by section from the Blueprint section kit. |
| D98 | Design | Design sign off | Blueprint approach signed off on 22 September 2026 | n/a | Covers homepage, catalogue results, lot detail, price guide, pricing, how we calculate and the phone lot and bid views. |
| D99 | Brand | Imagery | Real product UI, data visuals and bold type. No stock photos | Yes |  |
| D100 | UX | First experience | Paste a catalogue URL on the homepage and see sample triage before sign up | Yes | Cached shared auctions keep the cost low. Rate limited. |
| D101 | UX | Onboarding | Three step setup then a guided first analysis | Yes | GST, base location, profit target. |
| D102 | UX | Accessibility | WCAG 2.2 AA across site and app | Yes |  |
| D103 | Marketing | Acquisition | SEO, value guides and presence in reseller communities | Yes |  |
| D104 | Marketing | Signature content | Weekly Auction Breakdown of top undervalued lots in a real upcoming catalogue | Yes | Feeds the site, email, social and communities. |
| D105 | Marketing | Launch | Waitlist with founding member pricing, then public launch | Yes | Holding page with waitlist goes live in Week 1 of the build. |
| D106 | Brand | Product name | MaxBid | n/a | Always written MaxBid. Descriptive name, so trade mark search comes before logo work. |
| D107 | Brand | Domains | maxbid.com.au for the marketing site, app.maxbid.com.au for the app | n/a | maxbid.com belongs to a US auction house, so .com.au is the primary and only domain. |
| D108 | Build | Responsive approach | Mobile first responsive web. Robust desktop and phone experiences from one codebase | n/a | Base styles written for 360px, scaled up with min width breakpoints. |
| D109 | Build | Native feel on phones | Installable progressive web app in V1. No native apps | n/a | Moved from V2. Offline watchlist and bid view, home screen install, web push. |
| D110 | Build | Component library | Shared UI package in a Turborepo monorepo with a Storybook catalogue | Yes | Nothing is built twice. Site and app use the same components. |
| D111 | Build | Repository structure | One monorepo with two Next.js apps (web and app) sharing packages | n/a | Refines D88. Separate deploys, shared code. |
| D112 | Build | Page composition | Thin page shells that import sections, sections built from library components | n/a | Pages hold routing, metadata and data loading only. |
| D113 | Build | File size limit | Hard cap 300 lines per file, target 150 | Yes | Enforced by lint in CI. Pages 80 lines, functions 80 lines. |
| D114 | Brand | Writing style | Complete sentences in plain everyday words, with every term and figure explained | n/a | Replaces the short fragment style. Twelve writing rules and examples on tab 32. |
| D115 | Build | Single sources of truth | Bid maths, design tokens and disclaimer text each live in one package | n/a | Calculator, app, exports and site can never drift apart. |

## Decisions made after the discovery session

Each one has a decision record in docs/01-decisions/records.

| ID | Area | Question | Decision | Record | Rationale and implications |
| --- | --- | --- | --- | --- | --- |
| D116 | Design | Does V1 ship a dark theme | Light pages only. Dark mode is a later option | 0001 | No signed off prototype shows a dark screen. Amends D39, CS40, architecture.md and ux-standards.md. |
| D117 | Calculator | What are the three bid figures called | Target bid, limit bid and break even bid | 0002 | Absolute maximum was misleading because the break even bid sits above it. Amends D21 and D55. |
| D118 | Calculator | How are money figures rounded | Bid limits round down to whole dollars. Other figures round to the nearest dollar | 0003 | Rounding a bid limit up would advise a bid the evidence does not support. Amends CS02. |
| D119 | Calculator | Formulas for return on cost, cash needed and GST credits | Added to docs/02-specs/bid-calculation.md with a worked example | 0004 | Required by F28 and F32, previously undocumented. |
| D120 | Costs | Which resale figure does a repair percentage use | The selected scenario, GST inclusive, treated as a GST inclusive cost | 0005 | The repair estimate moves with the scenario. |
| D121 | Triage | How is the opportunity score calculated | Dollar headroom adjusted for confidence, scaled against the best lot in the catalogue | 0006 | The old fraction ranked small lots above large ones. Replaces the formula in matching-and-valuation.md. |
| D122 | Governance | What is the source of truth | The documents in docs. The workbook becomes a historical record | 0007 | A spreadsheet cannot be reviewed in a pull request. Amends docs/README.md. |
| D123 | Accounts | Is F03 Roles a Must or a Should | Must in Phase 1 | 0008 | F52, the security policies and the settings matrix all depend on roles. |
| D124 | Design | confidence_insufficient fails WCAG AA | Darken it from #6B7280 to #5B6472 | 0009 | Failed at 4.49 on the page and 4.09 on surface_muted. Found by the axe gate on its first run. |
| D125 | Design | Complete the token set, and where status colour may not go | Status and link text never sits on surface_muted. Names, spacing and motion settled | 0010 | Lightening surface_muted enough to pass would leave it 1.022 to 1 against the page, which destroys its purpose. |
