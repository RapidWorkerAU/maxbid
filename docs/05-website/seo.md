# Public Website and SEO

maxbid.com.au is the marketing site. app.maxbid.com.au is the app and is noindex.

Source: MaxBid Project Workbook, tab 34 Website SEO.

| Path | Page | Search intent | Schema | Content notes |
| --- | --- | --- | --- | --- |
| / | Home | Brand and product: auction bid calculator Australia | WebSite, Organization, SoftwareApplication | Drawing sheet header with search tabs, sample result detail cards, category tiles, auctions closing soon, split bar explanation, Auction Breakdown panel, popular guides |
| /how-it-works | How it works | How to value auction lots | WebPage, HowTo | Journey from tab 06 with real UI |
| /pricing | Pricing | Pricing intent | SoftwareApplication with offers | Tiers from tab 18, credit explainer, FAQ |
| /methodology | Methodology | How auction valuations work | Article | Public version of tabs 08 and 10. Key trust and AI citation asset |
| /accuracy | Accuracy | Is it accurate | Dataset, Article | Published accuracy by category (tab 31) |
| /changelog | Changelog | Trust and freshness | Article per entry | Method and data source releases |
| /calculators/max-bid | Max bid calculator | auction max bid calculator, buyer's premium calculator | WebApplication | Free public calculator using the maths in docs/02-specs/bid-calculation.md. Strong link magnet |
| /calculators/gst-auction | GST on auction purchases | GST on auction items Australia | WebApplication, FAQPage | Free calculator with plain explanation and not tax advice note |
| /auctions/grays | Grays guide | Grays buyer's premium, how to buy on Grays | Article, FAQPage | One guide per supported auction house. Premium facts dated and sourced |
| /auctions/pickles | Pickles guide | As above for Pickles | Article, FAQPage |  |
| /auctions/lloyds | Lloyds guide | As above for Lloyds | Article, FAQPage |  |
| /breakdowns | Auction Breakdowns hub | Undervalued auction lots this week | CollectionPage | Weekly breakdowns (tab 37) |
| /breakdowns/[slug] | Auction Breakdown | Specific auction name and category | Article | Top lots with estimates, confidence and links. No copied photos |
| /value/[category]/[brand]/[model] | Value guide | [brand] [model] price guide Australia, used [model] value | WebPage, Dataset, BreadcrumbList | Programmatic pages (tab 35) |
| /value/[category] | Category hub | Used [category] prices Australia | CollectionPage, BreadcrumbList | Links every guide in the category |
| /learn | Learn hub | Auction buying guides | CollectionPage | Evergreen guides and glossary |
| /learn/glossary/[term] | Glossary term | What is hammer price, buyer's premium, passed in | DefinedTerm, Article | Short answer first definitions. High AI citation potential |
| /learn/[guide] | Guide | How to flip auction items, how to inspect used machinery | Article | Written with real examples and our data |
| /compare/[alternative] | Comparison | MaxBid vs manual research, vs eBay Product Research | Article | Fair, factual comparisons |
| /about | About | Brand and founders | AboutPage, Organization, Person | Founder story, real people, Perth based. E E A T signal |
| /contact, /legal/* | Contact and legal | Trust | ContactPage | Terms, privacy, disclaimers from tabs 20 and 30 |

## Technical SEO checklist

| ID | Area | Requirement |
| --- | --- | --- |
| TS01 | Rendering | Static generation or incremental regeneration for every public page. No client only content. |
| TS02 | Metadata | Unique title and description per page through the Next.js metadata API. Titles under 60 characters. |
| TS03 | Canonicals | Self referencing canonical on every page. Parameter URLs canonicalised. |
| TS04 | Sitemaps | Segmented sitemaps for static pages, breakdowns, value guides and glossary, regenerated on publish. |
| TS05 | Robots | App subdomain noindex and disallowed. Crawler policy from tab 36. |
| TS06 | Locale | html lang en AU, Australian spelling, AUD prices, Australian business details in Organization schema. |
| TS07 | Core Web Vitals | LCP under 2.5s, INP under 200ms, CLS under 0.1 at the 75th percentile. |
| TS08 | Images | next/image, AVIF or WebP, explicit dimensions, descriptive alt text. |
| TS09 | Internal links | Breadcrumbs on every page. Guides link to category hubs, related models and the calculator. Breakdowns link to value guides. |
| TS10 | Structured data | JSON LD per page type in the table above, validated in CI. |
| TS11 | Open Graph | Generated share image, title and description for every page. |
| TS12 | Indexing | Search Console and Bing Webmaster Tools verified. IndexNow pings on publish. |
| TS13 | Errors and redirects | Custom 404 with search and popular links. Permanent redirects for any moved URL. |
| TS14 | Freshness | Last updated date visible and in schema on guides, breakdowns and value guides. |
| TS15 | Security | HTTPS only, HSTS, no mixed content. |


# Value Guides (Programmatic SEO)

Phase 2. Built only from our own aggregated data.

Source: MaxBid Project Workbook, tab 35 Value Guides.

## Page template

**Title pattern.** [Brand] [Model] used price guide Australia [Year]

**Answer first.** Opening sentence states the typical used price range in AUD, the evidence count and the date. Written so it can be quoted on its own.

**Data blocks.** Typical used range, recent auction results range, new price where known, price trend chart, evidence count by type, confidence label.

**Specifications.** Model specifications from product_spec_sources with source links and the DS23 note.

**What changes the value.** Options, hours, condition and age factors known for the model or category.

**Buying checklist.** Category We cannot verify items reframed as what to check before bidding.

**Related.** Similar models, category hub, max bid calculator, current lots of this model in supported auctions.

**Call to action.** Analyse a lot of this model. Set an alert for this model (later phase).

**FAQ.** Three to five short answer questions using real data, such as how much a used [Model] sells for at auction in Australia.

**Disclaimer.** DS02 style note and method version on every page.

## Publish rules

**Minimum evidence.** At least 5 priced comparables including at least 2 sold or realised results in the last 12 months before a page is indexable.

**Below threshold.** Page may exist for users but is noindex and excluded from sitemaps.

**Uniqueness.** Every indexable page must show figures unique to that model. No boilerplate only pages.

**Refresh.** Rebuilt weekly or when new evidence arrives. Last updated date shown.

**Data source rule.** Aggregated figures only. No copied listing text, no third party photos, no individual private seller details.

**Trade marks.** Brand and model names used only to identify the product. No logos. Note that the platform is not affiliated with the manufacturer.

**Quality review.** Templates reviewed by a person before rollout. Random sample of 20 pages reviewed each month.



# AI Search Visibility

Goal: be the source AI answers cite for Australian auction pricing questions. Verify crawler names before launch (O13).

Source: MaxBid Project Workbook, tab 36 AI Search.

| User agent | Provider | Purpose | Policy |
| --- | --- | --- | --- |
| OAI-SearchBot | OpenAI | Search and answers | Allow |
| ChatGPT-User | OpenAI | User requested fetch | Allow |
| GPTBot | OpenAI | Model training | Block |
| Claude-SearchBot | Anthropic | Search and answers | Allow |
| Claude-User | Anthropic | User requested fetch | Allow |
| ClaudeBot | Anthropic | Model training | Block |
| PerplexityBot | Perplexity | Search and answers | Allow |
| Perplexity-User | Perplexity | User requested fetch | Allow |
| Googlebot | Google | Search including AI Overviews | Allow |
| Google-Extended | Google | Gemini training and grounding control | Block |
| Bingbot | Microsoft | Search, also used by Copilot and others | Allow |
| Applebot-Extended | Apple | Model training | Block |
| CCBot | Common Crawl | Dataset used for training | Block |
| Trade off: blocking training crawlers protects our data but may reduce how well future models know the brand. Review after launch. |  |  |  |

## How we earn citations

| ID | Tactic | Detail |
| --- | --- | --- |
| G01 | Answer first writing | Every guide, glossary term and value guide opens with a one or two sentence direct answer that stands alone. |
| G02 | Citable facts | Dated, sourced numbers such as typical ranges, premium rates and accuracy stats, presented in plain HTML tables and lists. |
| G03 | Public methodology | The methodology, accuracy and changelog pages explain exactly how figures are made. AI engines favour sources that show their working. |
| G04 | Question coverage | FAQ sections target real questions: how much is buyer's premium on Grays, do you pay GST at auction, what is a used edgebander worth. |
| G05 | Entity consistency | Same name, description, location and founders across the site, schema, social profiles and directories. |
| G06 | Third party mentions | Useful presence in reseller communities, YouTube and industry sites. AI answers weigh what others say about us. |
| G07 | Freshness | Visible last updated dates and weekly breakdowns signal current data. |
| G08 | Clean structure | Semantic headings, tables and definition lists. No key facts hidden in images or scripts. |
| G09 | llms.txt | Publish an llms.txt listing key pages. Low cost, uncertain benefit, easy to maintain. |
| G10 | Measurement | Track a fixed set of 30 prompts across major AI engines monthly and record citations (O15). |
