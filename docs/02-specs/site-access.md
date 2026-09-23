# Auction site access

What each auction site permits a computer to do automatically. This closes open item O05.

D45 commits us to respecting each site's terms and robots rules, public pages only, rate limited, no login bypass. The legal specification adds: stop and seek permission where terms prohibit automated access. This page records what those terms actually say, so nobody has to guess.

**Checked on 23 September 2026 by Claude Code, reviewed by Ashleigh Phillips.** Recheck before public launch, and whenever an extractor is rebuilt. Terms change without notice.

## Summary

| Site | robots.txt | Terms of use | May we extract? |
| --- | --- | --- | --- |
| Grays | Permits the pages we need | Not yet read, see below | Unconfirmed |
| Pickles | Disallows the pages we need | Prohibits scraping | **No, not without permission** |
| Lloyds | Permits everything | No clause found | Yes, with care |

## Grays

**Domain.** www.grays.com. The older graysonline.com name does not resolve for automated requests, so any extractor must use grays.com.

**robots.txt.** Permissive. It disallows only `/Services/*`, `/Mobile/*`, `/login.aspx`, `/cartsummary.aspx`, `/changetimezone.aspx`, one ACCC statement page and `*.axd` files. Catalogue and lot pages are not disallowed. A sitemap is published at `https://www.grays.com/sitemap.xml`.

**Terms of use.** **Not read.** The terms page at `content.aspx?block=Terms_Of_Use_GOL` is rendered by JavaScript and returned no readable text to either of the tools available here. This is a gap, not a clearance.

**What this means.** robots.txt permits the pages we need, but robots.txt is not the terms of use, and one does not stand in for the other. **Somebody has to open that page in a browser and read it before a Grays extractor is built.**

## Pickles

**Domain.** www.pickles.com.au.

**robots.txt disallows the pages we need.** Among the rules are:

```
Disallow: /cars/vehicle/*/itemid-*/lotid-*
Disallow: /general/item/*/itemid-*/lotid-*
Disallow: /trucks/item/*/itemid-*/lotid-*
Disallow: /damaged-salvage/vehicle/*/itemid-*/lotid-*
Disallow: /*/auctions?*
Disallow: /catalogue/
Disallow: /upcoming-auctions/catalogue/
Disallow: /api-website/buyer/ms-web-asset-search/v2/api/product/public/
Disallow: /api-website/buyer/ms-web-asset-aggregate/v2/api/
```

Those are lot detail pages, auction listings, catalogues and their own buyer facing APIs. They are precisely what an extractor would need.

**The terms of use prohibit it directly.** The Online User Terms and Conditions, clause 9(b)(vi), say a user must not:

> scrape, harvest, copy or exploit Platform data except as expressly permitted by Pickles

**What this means.** Extracting Pickles catalogues is prohibited twice over, in robots.txt and in the terms. The clause leaves one door open: **except as expressly permitted by Pickles**. So the route to supporting Pickles is an agreement with them, not a better extractor.

## Lloyds

**Domain.** www.lloydsauctions.com.au.

**robots.txt permits everything.** The file contains `User-agent: *` with an empty `Disallow:`, which allows all paths. Two sitemaps are published.

**Terms of use.** The Users Agreement at `/terms/` was read in full and **contains no clause** about automated access, robots, crawlers, scraping, harvesting, data mining or reuse of listings.

**One caution.** A request without a browser user agent was refused with a 403, so there is anti bot protection at the edge even though robots.txt is open. That is a technical measure, not a legal one, and D34 already chose a managed extraction service to deal with exactly this. It is not permission to disguise ourselves: rate limits and public pages only still apply.

## Rules for every extractor

1. Read and obey `robots.txt` on every run, not once at build time. A site can change it any day.
2. Identify ourselves honestly in the user agent. Never impersonate a browser to defeat a block that is there on purpose.
3. Rate limit per site. R02 rates a site blocking us at 12.
4. Public pages only. Never sign in, never bypass a paywall or a login.
5. Store the payload in `raw_extract` so a retry does not mean a refetch.
6. Recheck this page before public launch, and whenever a site changes its structure.
