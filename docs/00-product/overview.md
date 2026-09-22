# Executive Summary

Source: MaxBid Project Workbook, tab 01 Summary.

**Name.** MaxBid at maxbid.com.au. App at app.maxbid.com.au.

**Vision.** A decision support platform that turns any supported Australian auction catalogue into a ranked list of buying opportunities, each with evidenced market values, full acquisition costs and a safe maximum bid.

**Problem.** Resellers buying at auction guess at resale value, forget costs such as buyer's premium, GST, transport and repairs, and bid on emotion in the final seconds. Researching every lot manually across eBay, retailers and past auction results takes hours per catalogue.

**Solution.** Paste a catalogue link or upload a PDF. The platform extracts every lot, runs a fast triage to rank opportunities, then performs deep analysis on the lots the user shortlists. Deep analysis identifies the item using text and photos, finds comparable sold and advertised prices, explains exactly what each comparable is and how it differs, and calculates the target bid, the limit bid and the break even bid against the user's own costs and profit goal.

**Core principle.** Transparency over false precision. Every value shows its evidence, the match level, the differences and a confidence rating. The system never presents a weak estimate as a verified value.

**Primary user.** Resellers and flippers buying at auction for profit in Australia.

**Launch sources.** Grays, Pickles and Lloyds, plus PDF catalogue upload as a universal fallback.

**Category scope.** All auction categories, using a category agnostic matching engine with category specific valuation rules added progressively.

**Build approach.** Built in house by Ashleigh using Claude Code and Codex on Next.js, Supabase and Vercel. Used internally first, commercialised once proven.

**MVP goal.** Internal MVP in six to eight weeks that we use on real auctions, recording actual outcomes to measure valuation accuracy before any public launch.

**Commercial path.** Subscription tiers with included deep analysis credits and top up packs. Free triage as the entry point.

**Defensibility.** The long term moat is the accumulated database of identified products, comparables, user corrections and verified sold outcomes. Every analysis makes the next one more accurate.



# Target Users and Personas

Source: MaxBid Project Workbook, tab 03 Users.

| ID | Priority | Persona | Description | Main pain points | What they need most | Likely tier |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | Primary | Part time reseller | Buys a few lots a month on Grays and Pickles and resells on eBay, Facebook Marketplace and Gumtree. | Overpaying, forgetting costs, time spent researching each lot. | Fast triage, clear target bid, mobile bid sheet. | Starter |
| P2 | Primary | Full time flipper | Treats auction buying as a business. Reviews many catalogues each week across categories. | Volume of lots, cash flow, GST treatment, tracking actual margins. | Bulk triage, cost profiles, GST cash view, outcome tracking and margin history. | Pro |
| P3 | Internal | Us (Ashleigh and Jason) | Buying machinery, tools and general stock, including woodworking equipment for Perth Cabinet Doors. | Knowing what a machine is really worth before committing. | Accurate machinery matching and evidence trail. | Internal |
| P4 | Secondary | Dealer or liquidator | Buys in volume with several staff reviewing catalogues. | Consistency across buyers, approval before bidding, team visibility. | Team accounts, shared watchlists, roles, exports. | Dealer |
| P5 | Secondary | Trade business buyer | Buys equipment for own use rather than resale. | Knowing a fair price compared with buying new or used elsewhere. | New price and cheapest available comparison. | Starter |


# Competitor Landscape

Based on the earlier research. Recheck before launch.

Source: MaxBid Project Workbook, tab 04 Competitors.

| Tool | What it does | Gap | Relevance to us |
| --- | --- | --- | --- |
| eBay Product Research | Sold price history, price ranges, shipping and sell through rates for eBay listings. | eBay only. No auction catalogue input, no acquisition cost or bid calculation. | Data source for us rather than a direct competitor. |
| Machinio | Aggregates used machinery listings, specifications and advertised prices worldwide. | Advertised prices only. No catalogue analysis or bid limits. | Possible reference source for machinery comparables. |
| EquipmentWatch | Professional valuations for heavy equipment, with API access. | Heavy equipment focus and professional pricing. No auction workflow. | Possible paid data partner later for plant and heavy equipment. |
| WorthPoint | Realised auction results for antiques and collectibles. | Collectibles only. No cost or bid engine. | Possible reference for collectibles category. |
| Manual research | Google, eBay and dealer sites searched lot by lot. | Slow, inconsistent, no cost modelling, no evidence record. | This is the real incumbent we replace. |
**Our position.** No known tool takes an Australian auction catalogue, assesses every lot, calculates full acquisition costs and tells a reseller what to bid with evidenced, confidence rated comparables.



# Scope

V1 is the internal MVP. V2 is the commercial launch. Later covers growth features.

Source: MaxBid Project Workbook, tab 05 Scope.

| Area | In V1 (internal MVP) | V2 and later | Excluded |
| --- | --- | --- | --- |
| Catalogue input | Grays, Pickles and Lloyds URLs. PDF catalogue upload. | Slattery, Manheim, other auction houses. Browser extension. | Facebook groups and private sales. |
| Lot processing | Extraction, triage of all lots, deep analysis of shortlisted lots. | Scheduled re analysis before close. Bulk deep analysis. |  |
| Identification | Text and photo vision identification with user confirmation. | Category specific identification rules such as VIN and rego lookup for vehicles. |  |
| Comparables | eBay active listings, web search results, retailer pages, auction realised results, internal outcome data. | eBay Marketplace Insights sold data if approved. Paid data partners for heavy equipment. | Scraping of sites whose terms prohibit it. |
| Valuation | Match levels, evidence weighting, confidence score, conservative, expected and optimistic resale. | Category specific depreciation and condition models. | Formal valuation certificates. |
| Calculator | Target bid, limit bid and break even bid. Profit slider. Editable cost lines. GST by profile. Cost profiles. Transport estimate. | Automatic channel selling fees as an optional helper. |  |
| After analysis | Watchlist, closing soon alerts, outcome recording, PDF bid sheet, CSV export. | Saved search alerts for new undervalued lots. Price drop alerts. Margin dashboard. | Automated bidding on behalf of users. |
| Accounts | Organisations with members and roles. Email and Google sign in. | Stripe billing, credits, top ups, free tier limits. | Enterprise SSO. |
| Platforms | Mobile first responsive web app. Installable progressive web app with offline watchlist and bid view. | Richer offline support. | Native mobile apps. |
| Geography | Australia. | New Zealand. | Global. |


# User Journey

End to end flow for a reseller analysing one catalogue

Source: MaxBid Project Workbook, tab 06 User Journey.

| Step | Stage | What the user does | What the system does | Screen |
| --- | --- | --- | --- | --- |
| 1 | Submit | User pastes an auction URL or uploads a PDF and selects a cost profile. | Platform detected, auction created, analysis job queued. | Submit screen |
| 2 | Extract | User sees a progress bar and can leave the page. | Lots, photos, descriptions, locations, closing times, current bids and buyer's premium terms extracted. | Analysis progress |
| 3 | Triage | User receives an email and opens the ranked triage list. | Quick identification, rough resale range, rough max bid and opportunity score for every lot. | Triage table |
| 4 | Filter and shortlist | User filters by category, value, location and closing time and ticks lots for deep analysis. Credit cost shown before confirming. | Deep analysis jobs queued per lot. | Triage table |
| 5 | Deep analysis | User waits or returns later. Lots fill in as they complete. | Vision identification, comparable search, match grading, valuation and bid calculation. | Lot detail |
| 6 | Confirm identification | User confirms or corrects the identified product. | Correction stored. Lot revalued automatically. | Lot detail |
| 7 | Review evidence | User reads the match explanation and opens comparable links. | Evidence shown with match level, differences, date checked and confidence. | Lot detail, evidence panel |
| 8 | Adjust costs and profit | User expands cost lines, edits repairs or transport, sets profit in dollars or percentage, moves the bid slider. | The target bid, the limit bid and the break even bid recalculate instantly. | Lot detail, calculator |
| 9 | Watch and export | User adds lots to the watchlist and downloads the PDF bid sheet. | Closing soon alerts scheduled. Bid sheet generated. | Watchlist, export |
| 10 | Bid | User bids on the auction site using the mobile bid view. | Mobile view shows the lot, the target bid, the limit bid and a clear stop line at the break even bid. | Mobile bid view |
| 11 | Record outcome | User records won or lost, final hammer price and later the actual resale price. | Outcome stored as verified evidence and used to measure accuracy. | Outcomes |
