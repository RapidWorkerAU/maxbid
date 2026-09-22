# Data Sources

Check each source's current terms and API access before build. Cost values are estimates.

Source: MaxBid Project Workbook, tab 11 Data Sources.

| Source | Role | Access method | Data obtained | Terms and risk notes | Legal risk | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| Grays | Auction catalogue | Managed extraction (Firecrawl or Browserbase) | Lots, photos, descriptions, location, closing time, current bid, premium terms | Review terms. Public pages only, rate limited. | Medium | PDF upload |
| Pickles | Auction catalogue | Managed extraction | As above | As above | Medium | PDF upload |
| Lloyds | Auction catalogue | Managed extraction | As above | As above | Medium | PDF upload |
| Auction PDF catalogues | Auction catalogue | PDF text extraction with OCR fallback, then Claude structuring | Lots and descriptions. Photos where embedded. | User supplied. Low risk. | Low | Manual lot entry |
| Past auction results | Sold evidence | Managed extraction of published results pages where available | Realised hammer prices | Review terms per site. | Medium | Internal outcomes |
| eBay Browse API | Advertised evidence | Official API | Active listings, price, condition, location | Official API terms. Low risk. | Low | Web search API |
| eBay Marketplace Insights API | Sold evidence | Official API, restricted access | Sold prices | Requires eBay approval. Apply early. | Low | Auction results and internal outcomes |
| Web search API (Brave or SerpAPI) | Discovery | Official API | Retailer and dealer pages, new prices, specification pages | Official API terms. | Low | Alternative search provider |
| Retailer and dealer pages | Advertised and new price evidence | Fetch pages found through search, extract price and specs with Claude | Advertised price, new price, specifications | Respect robots and terms. Cache seven days. | Medium | Search snippet only, lower weight |
| Manufacturer sites | Specification and new price | Fetch via search results | Specs, RRP, model history | Low | Low | Mark new price not found |
| Internal outcomes | Sold evidence | Our own database | Actual hammer and resale prices recorded by users | Our data. Privacy policy must cover use. | Low | None needed |
| Internal comparables history | All evidence | Our own database | Every comparable seen, with price snapshots over time | Our data derived from public sources. | Low | None needed |
| Routing API (Google Routes or Mapbox) | Transport | Official API | Road distance between user base and lot location | Official API terms. | Low | Straight line distance with uplift factor |
