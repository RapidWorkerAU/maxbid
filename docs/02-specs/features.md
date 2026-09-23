# Feature Register

Priority uses MoSCoW. Phase 1 is the internal MVP.

Source: MaxBid Project Workbook, tab 07 Features.

| ID | Module | Feature | Description | Priority | Phase | Depends on | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F01 | Accounts | Sign in | Email magic link and Google sign in through Supabase Auth. | Must | 1 |  | User can sign in and out on desktop and mobile. |
| F02 | Accounts | Organisations | Every user belongs to an organisation. Data is scoped to the organisation. | Must | 1 | Sign in | Two members of one organisation see the same analyses. Other organisations see nothing. |
| F03 | Accounts | Roles | Owner, admin, buyer and viewer roles. | Must | 1 | Organisations | Viewer cannot edit costs or spend credits. |
| F04 | Accounts | Profile settings | GST registered, base location, default cost profile, default profit target. | Must | 1 | Organisations | Changing GST registration recalculates all open lots. |
| F05 | Input | URL submission | Paste a Grays, Pickles or Lloyds URL. Platform detected automatically. | Must | 1 |  | Unsupported URLs show a clear message and offer PDF upload. |
| F06 | Input | PDF upload | Upload an auction catalogue PDF for extraction. | Must | 1 |  | Lots extracted from a text PDF and a scanned PDF with at least 90 percent completeness in testing. |
| F07 | Input | Grays extractor | Structured extraction of lots, photos, location, closing time, current bid and terms. | Must | 1 | Extraction service | All lots from a 300 lot catalogue extracted with correct lot numbers. |
| F08 | Input | Pickles extractor | As above for Pickles. | Must | 2 | Written permission from Pickles | Blocked by decision record 0012. Pickles prohibits automated access. Build only once permission is in writing. |
| F09 | Input | Lloyds extractor | As above for Lloyds. | Must | 1 | Extraction service | As above. |
| F10 | Input | Buyer's premium extraction | Read premium rates and GST terms from each auction's terms. Fall back to platform default. | Must | 1 | Extractors | Premium shown with its source and is editable. |
| F11 | Processing | Background jobs | Durable jobs with retries and fan out per lot. | Must | 1 |  | A failed lot retries without restarting the catalogue. |
| F12 | Processing | Progress and email | Live progress bar and email when triage completes. | Must | 1 | Background jobs | Email arrives within five minutes of completion. |
| F13 | Triage | Quick identification | Low cost model identifies each lot from text and the primary photo. | Must | 1 | Background jobs | Category and product type assigned to every lot. |
| F14 | Triage | Rough valuation | One search pass returns a rough resale range and rough max bid. | Must | 1 | Quick identification | Range shown with a triage confidence label. |
| F15 | Triage | Opportunity score | Score from 0 to 100 ranking lots by dollar headroom adjusted for confidence, per decision record 0006. | Must | 1 | Rough valuation | Table sorted by score by default. |
| F16 | Triage | Filters | Category, value range, location and closing time. | Must | 1 | Triage table | Filters combine and persist for the session. |
| F17 | Triage | Shortlist and credit preview | Tick lots for deep analysis. Show credits required before confirming. | Must | 1 | Credits ledger | User cannot exceed available credits. |
| F18 | Deep analysis | Vision identification | Larger model reads all lot photos including data plates and labels. | Must | 1 | Background jobs | Brand and model extracted from plate photos in testing. |
| F19 | Deep analysis | Identification confirmation | User confirms or edits brand, model, year, specs and condition. | Must | 1 | Vision identification | Edit triggers automatic revaluation. |
| F20 | Deep analysis | Comparable search | Search eBay, web search API, retailer pages, auction realised results and internal data. | Must | 1 | Data sources | Each lot returns up to 15 candidate comparables. |
| F21 | Deep analysis | Match grading | Assign match level, reason and differences to each comparable. | Must | 1 | Comparable search | Every comparable shows a match level and a plain English reason. |
| F22 | Deep analysis | New price lookup | Find current or last known new retail price. | Should | 1 | Comparable search | New price shown with source and date or marked not found. |
| F23 | Deep analysis | Cheapest currently advertised | Lowest current advertised comparable of similar specification. | Must | 1 | Match grading | Shown with link, match level and date checked. |
| F24 | Valuation | Evidence weighting | Weight comparables by type, match level and age. | Must | 1 | Match grading | Weights visible in the evidence panel. |
| F25 | Valuation | Resale scenarios | Conservative, expected and optimistic resale values. | Must | 1 | Evidence weighting | Conservative drives the default max bid. |
| F26 | Valuation | Confidence score | High, medium, low or insufficient based on the confidence model. | Must | 1 | Evidence weighting | Insufficient lots show no max bid unless the user enters a resale price. |
| F27 | Calculator | Bid limits | Target bid, limit bid and break even bid. | Must | 1 | Resale scenarios | Matches docs/02-specs/bid-calculation.md to the cent. |
| F28 | Calculator | Profit target | Dollars or percentage return on cost, set per lot. | Must | 1 | Bid limits | Switching mode recalculates instantly. |
| F29 | Calculator | Bid slider | Proposed hammer bid slider linked to profit and return. | Must | 1 | Bid limits | Green, amber and red zones match target and minimum settings. |
| F30 | Calculator | Editable cost lines | Collapsed summary that expands to editable line items. | Must | 1 | Cost profiles | Edits save per lot and recalculate instantly. |
| F31 | Calculator | Selling fee flag | Warn when selling fees are blank. | Must | 1 | Editable cost lines | Flag visible on the lot row and in the bid sheet. |
| F32 | Calculator | GST engine | Cash needed on the day and cost after GST credits based on profile. | Must | 1 | Profile settings | Matches docs/02-specs/bid-calculation.md for registered and unregistered cases. |
| F33 | Calculator | Cost profiles | Multiple saved profiles of default costs. | Must | 1 | Organisations | New lots inherit the selected profile. |
| F34 | Calculator | Transport estimate | Distance from base to lot location multiplied by rate per km plus base fee by size class. | Should | 1 | Routing API | Estimate shown with distance and editable. |
| F35 | After analysis | Watchlist | Save lots across auctions. | Must | 1 |  | Watchlist shows live closing countdown. |
| F36 | After analysis | Closing soon alerts | Email and push alerts before a watchlisted lot closes. | Should | 1 | Watchlist | Alert timing set by the user. |
| F37 | After analysis | Outcome recording | Won or lost, hammer price, actual resale price and date. | Must | 1 |  | Outcome feeds internal comparables. |
| F38 | After analysis | PDF bid sheet | One line per lot with the target bid and the limit bid, readable on a phone. | Must | 1 | Bid limits | Generates in under ten seconds for 50 lots. |
| F39 | After analysis | CSV export | Full lot data with costs and bids. | Should | 1 |  | Opens cleanly in Excel. |
| F40 | Mobile | Mobile bid view | Large type view of watchlisted lots with target, maximum and stop line. | Must | 1 | Watchlist | Usable one handed on a phone. |
| F41 | Admin | Platform admin | Manage auction platforms, premium defaults, categories and extractor health. | Should | 1 |  | Admin can update a platform default without a deploy. |
| F42 | Admin | Cost and usage logging | Record AI, search and extraction cost per job. | Must | 1 | Background jobs | Cost per catalogue visible in admin. |
| F43 | Billing | Stripe subscriptions | Tiers with monthly credit allowance. | Must | 2 | Organisations | Credits granted on renewal. |
| F44 | Billing | Top up packs | One off credit purchases. | Should | 2 | Stripe subscriptions | Credits available immediately after payment. |
| F45 | Billing | Free tier limits | Limited triage catalogues and starter credits. | Must | 2 | Stripe subscriptions | Limits enforced server side. |
| F46 | Growth | Saved search alerts | Alert when a new lot matches saved criteria with a high opportunity score. | Could | 3 | Triage |  |
| F47 | Growth | Margin dashboard | Actual versus predicted margin over time. | Could | 3 | Outcome recording |  |
| F48 | Growth | Additional auction sources | Slattery, Manheim and others. | Should | 3 | Extractors |  |
| F49 | Growth | Category rules | Vehicle, machinery, tools, electronics specific valuation rules. | Should | 2 | Valuation |  |
| F50 | Growth | Automatic selling fees helper | Optional channel fee presets. | Could | 3 | Editable cost lines |  |
| F51 | Configuration | Settings resolution engine | Resolves each setting from Platform, Organisation, User and Lot layers with lock rules. | Must | 1 | Organisations | Unit tests cover every precedence and lock case on tab 28. |
| F52 | Configuration | Organisation setting locks | Admins lock chosen settings as Fixed or Floor. Enforced in the database. | Must | 1 | Settings resolution engine | A buyer cannot save a value below a Floor lock through the UI or API. |
| F53 | Configuration | Override markers and reset | Marker on every overridden field with one click reset to system value. | Must | 1 | Editable cost lines | Reset restores the current system value and records the change. |
| F54 | Configuration | Override summary | Per lot list of every field changed from the system value. | Must | 1 | Override markers and reset | Summary shows field, system value, your value, who and when. |
| F55 | Transparency | Provenance tags | Verified, Extracted, Estimated or Your input tag on every figure. | Must | 1 |  | No figure renders without a tag. |
| F56 | Transparency | AI generated labels | Label on identifications, match reasons and summaries. | Must | 1 |  | Label present wherever AI output is shown. |
| F57 | Transparency | Searched and not found panel | Lists every source queried, results found and what was not found. | Must | 1 | Comparable search | Panel shows all sources even when zero results. |
| F58 | Transparency | We cannot verify panel | Fixed general list plus category specific items. | Must | 1 | Categories | Present on every lot and in the bid sheet. |
| F59 | Transparency | How this was calculated | Expander on every bid limit showing inputs, tags, formula in words and method version. | Must | 1 | Bid limits | Figures in the expander reconcile to the bid limit. |
| F60 | Transparency | Stale data warning | Warning on prices checked more than seven days ago with refresh action. | Must | 1 | Comparable search | Warning appears on day eight. |
| F61 | Helper behaviour | Add user comparable | User adds a link or price as a private comparable. | Should | 1 | Evidence weighting | Visible only within the organisation and tagged User supplied. |
| F62 | Helper behaviour | Exclude comparable with reason | Exclusion requires a reason and shows valuation before and after. | Must | 1 | Evidence weighting | Before and after values shown in the override summary. |
| F63 | Helper behaviour | Soft warnings | Warnings for risky bids and inputs without blocking. | Must | 1 | Disclaimer library | Every situation on tab 28 produces the correct response. |
| F64 | Governance | Report a problem | Report action on every lot, identification and comparable. | Must | 1 |  | Report reaches the admin queue with full context. |
| F65 | Governance | Correction review queue | Admin queue for corrections that would change shared data. | Must | 1 | Report a problem | Approved change applies to shared record with provenance recorded. |
| F66 | Governance | Terms versioning and clickwrap | Versioned terms with recorded acceptance and re acceptance on material change. | Must | 1 | Sign in | User cannot continue after a material change until accepted. |
| F67 | Governance | Method versioning | Every valuation stamped with method version. Newer method prompt with user chosen recalculation. | Must | 1 | Valuation | Old valuation remains viewable after recalculation. |
| F68 | Governance | Public changelog | Changelog page for method and data source changes. | Should | 1 | Method versioning | Every method release has an entry. |
| F69 | Governance | Platform settings admin | Admin editable platform defaults with change log. | Must | 1 | Platform admin | Every change records old value, new value, who and why. |
| F70 | Governance | Organisation audit history | History view of changes across the organisation. | Should | 1 | Audit log | Filter by user, lot and date. |
| F71 | Enrichment | Lot enrichment | Fill missing specifications from manufacturer, dealer and specification sources once the item is identified. | Must | 1 | Vision identification | Every enriched field carries a source class, provenance tag, source link and date checked. |
| F72 | Enrichment | Source class separation | Each field shown under Model specifications, Observed on this lot, Auctioneer stated or Not verified. | Must | 1 | Lot enrichment | No model specification is ever displayed as confirmed for the unit. |
| F73 | Enrichment | Conflict flags | Where sources disagree, show both values side by side with a conflict flag. | Must | 1 | Lot enrichment | Conflicts appear on lot detail, spec sheet and bid sheet. |
| F74 | Enrichment | Not identified state | Lots that cannot be identified show Not identified and a field for the user to enter brand and model. | Must | 1 | Vision identification | User entry triggers enrichment and revaluation. |
| F75 | Enrichment | Optional equipment check | List the model's known options and mark each as observed, stated, absent or not verified for this lot. | Should | 1 | Lot enrichment | Options list shown for machinery and vehicles where manufacturer data lists options. |
| F76 | Enrichment | PDF spec sheet | Downloadable spec sheet per lot with source classes, links, conflicts and disclaimer. | Must | 1 | Lot enrichment | Every field on the PDF matches lot detail. |
| F77 | Website | Marketing site | Public site at root domain per tab 34, server rendered, light pages with navy blueprint headers. | Must | 2 | Brand | All pages meet tab 34 technical SEO checklist. |
| F78 | Website | Waitlist holding page | Branded holding page with email capture and founding member promise. | Must | 1 | Brand name | Live in Week 1. Sign ups stored with source. |
| F79 | Website | Try before sign up | Homepage URL field returns a sample triage from cached shared data. | Must | 2 | Triage engine | Result in under 60 seconds for cached auctions. Rate limited. |
| F80 | Website | Value guide pages | Programmatic price guides per tab 35. | Should | 2 | Outcome and comparable data | Only pages meeting the threshold are indexable. |
| F81 | Website | Auction Breakdown pages | Weekly public breakdown pages with email and social assets. | Must | 2 | Triage engine | Published weekly from an admin template. |
| F82 | Website | Structured data | Organization, WebSite, SoftwareApplication, Article, Dataset, BreadcrumbList and FAQPage where relevant. | Must | 2 | Marketing site | Validates in Google Rich Results Test and Schema validator. |
| F83 | Website | Dynamic social images | Generated Open Graph images for every public page. | Should | 2 | Marketing site | Every shared link renders a branded card. |
| F84 | Onboarding | Three step setup | GST registered, base location, profit target. | Must | 1 | Profile settings | Completable in under two minutes. |
| F85 | Onboarding | Guided first analysis | Walks the user through triage, shortlist and one deep analysis with inline tips. | Must | 1 | Three step setup | Tips dismissable and never shown again once dismissed. |
| F86 | Growth | Referral programme | Referrer and referred organisation both receive bonus credits after first payment. | Should | 2 | Stripe subscriptions | Credits applied automatically. |
| F87 | Growth | Lifecycle email | Welcome, first result, closing alerts, outcome reminder, win back. | Must | 2 | Email | Every email has an unsubscribe except transactional alerts. |
| F88 | Build | Component library | packages/ui with tokens, primitives and composites, catalogued in Storybook. | Must | 1 |  | Every UI element used in a page exists in the library with stories. |
| F89 | Build | Shared calculation package | packages/calc holds the bid engine used by site, app, exports and tests. | Must | 1 |  | Tab 10 cases pass as unit tests to the cent. |
| F90 | Build | Shared content package | packages/content holds disclaimer messages DS01 to DS35 and standard phrases. | Must | 1 |  | No disclaimer text is typed directly into a page. |
| F91 | Mobile | Installable web app | Web app manifest, icons, standalone display and install prompt. | Must | 1 |  | Installs to home screen on iOS and Android. |
| F92 | Mobile | Offline bid view | Service worker caches watchlist and bid view data. | Must | 1 | Installable web app | Bid view shows last synced figures with no signal and a clear last updated time. |
| F93 | Mobile | Web push alerts | Closing soon alerts through web push on installed app. | Should | 1 | Installable web app | Alert received on an installed iPhone and Android device. |
| F94 | Governance | Accuracy page | Published accuracy by category once minimum outcomes are reached. | Could | 2 | Outcome recording | Categories below the minimum show Not enough data yet. |
