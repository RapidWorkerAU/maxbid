# Commercial Model

Indicative pricing in AUD excluding GST. Validate after the internal MVP. One credit equals one deep analysed lot.

Source: MaxBid Project Workbook, tab 18 Commercial.

| Tier | Monthly price ($) | Triage catalogues per month | Deep credits per month | Seats | Includes | Target persona |
| --- | --- | --- | --- | --- | --- | --- |
| Free | 0 | 1 | 5 | 1 | Triage, limited deep analysis, watchlist | Entry point |
| Starter | 79 | 5 | 40 | 1 | All V1 features, PDF bid sheet, alerts | Part time reseller |
| Pro | 199 | 12 | 100 | 3 | Everything in Starter, CSV export, outcome analytics | Full time flipper |
| Dealer | 699 | 40 | 400 | 10 | Everything in Pro, team roles, priority processing | Dealers and liquidators |

| Top up pack | Credits | Price ($) | Price per credit |
| --- | --- | --- | --- |
| Top up small | 25 | 39 | 1.56 |
| Top up large | 100 | 129 | 1.29 |
**Credit rules.** Credits reserved when deep analysis starts and settled on completion. Failed lots are refunded automatically. Revaluation after a correction is free when cached comparables are reused and costs one credit when a new search is needed.

**Rollover.** Unused plan credits roll over for one month. Top up credits last twelve months.

**Annual plans.** Two months free on annual billing.

**Pricing rule.** Price per credit must stay well above the deep analysis cost per lot in docs/02-specs/unit-costs.md. Every tier should hold at least 30 percent gross margin at full usage. First draft prices failed this test and were revised.



# Legal and Compliance

Obtain legal review of terms and disclaimers before public launch.

Source: MaxBid Project Workbook, tab 20 Legal.

| Area | Requirement | Where it applies |
| --- | --- | --- |
| Positioning | Decision support tool. Not valuation advice, financial advice or a guarantee of resale value. | Terms of use, onboarding, lot detail footer, bid sheet footer |
| Standard disclaimer | Values are estimates based on publicly available information at the date checked. Inspect items and verify condition before bidding. You are responsible for your bidding decisions. | Every lot and every export |
| Confidence disclosure | Match level and confidence shown next to every value. Insufficient evidence lots show no system bid. | Lot detail, triage table |
| Australian Consumer Law | Avoid misleading claims in marketing such as guaranteed profit or accurate valuations. | Website, ads, emails |
| GST | Calculator explains GST treatment in plain terms and states it is not tax advice. | Calculator panel, help page |
| Privacy | Privacy policy aligned to the Australian Privacy Principles. Explicit consent before pooled use of outcomes. | Sign up, settings |
| Third party content | Show link, price, date and our own text summary. Do not copy or display third party photos as comparables. | Evidence panel |
| Auction data access | Respect each site's terms and robots rules. Public pages only. Rate limited. No login bypass. Stop and seek permission where terms prohibit automated access. | Extractors |
| API terms | Comply with eBay, search API and routing API terms including attribution and caching limits. | Data layer |
| Automated bidding | Not offered. Users bid themselves on the auction site. | Scope |
