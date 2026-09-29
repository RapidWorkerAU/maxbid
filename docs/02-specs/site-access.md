# Auction site access

What each auction site permits a computer to do automatically. This closes open item O05.

D45 commits us to respecting each site's terms and robots rules, public pages only, rate limited, no login bypass. The legal specification adds: stop and seek permission where terms prohibit automated access. This page records what those terms actually say, so nobody has to guess.

**Checked on 23 September 2026 by Claude Code, reviewed by Ashleigh Phillips.** Recheck before public launch, and whenever an extractor is rebuilt. Terms change without notice.

## Summary

| Site | robots.txt | Terms of use | May we extract? |
| --- | --- | --- | --- |
| Grays | Permits the pages we need | No clause found | Yes, with care |
| Pickles | Disallows the pages we need | Prohibits scraping | **No, not without permission** |
| Lloyds | Permits everything | No clause found | Yes, with care |

## Grays

**Domain.** www.grays.com. The older graysonline.com name does not resolve for automated requests, so any extractor must use grays.com.

**robots.txt.** Permissive. It disallows only `/Services/*`, `/Mobile/*`, `/login.aspx`, `/cartsummary.aspx`, `/changetimezone.aspx`, one ACCC statement page and `*.axd` files. Catalogue and lot pages are not disallowed. A sitemap is published at `https://www.grays.com/sitemap.xml`.

**Terms of use.** Read in a browser by Ashleigh on 23 September 2026, because the page is rendered by JavaScript and returns no readable text to automated tools. Searching it for robot, scrape, automated and extract found **no clause** on any of them.

**What this means.** Nothing in the Grays terms prohibits automated access, and robots.txt permits the pages we need. A Grays extractor may be built, under the rules at the foot of this page.

**The limit of that finding.** A keyword search is not a legal review. It would not catch a restriction written as systematic retrieval, data mining, or a general limit on commercial use of content. Two things already cover that ground: D44 keeps third party images out of the product and uses our own text summaries instead, and O10 puts the terms in front of a lawyer before public launch. Recheck this page then.

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

## Never read a cached copy of an auction page

Every fetch asks Firecrawl for the page as it is now, with `maxAge` set to
zero. Firecrawl otherwise serves a copy it took up to two days ago.

This was found in the first live run. The same catalogue came back with a
byte identical countdown fourteen minutes apart, so the closing time worked
out from it was fourteen minutes late. The current bids were as old as the
copy. Bids are the figure the whole product reasons about, so a stale one
would produce a target bid that is simply wrong.

Fetching fresh every time costs more credits. That is the right trade for a
live auction. The setting is `SCRAPE_OPTIONS` in
`apps/app/src/extract/firecrawl.ts`, and a test holds it to zero.

## Past results are on the lot page, not the catalogue

A Grays catalogue page for a closed sale shows "Bidding closed" and no price.
Checked on sale 23502297: not one dollar figure on the whole page.

The lot page states it plainly:

> 25 September 2026 21:00 AEST
> Sold for
> $260
> The auction has ended.

So gathering results means one fetch per lot rather than one per sale. That is
the cost decision record 0020 accepts, because the result is public
information about a completed sale, is stored once and is read by every
organisation and every later analysis after that.

The same rules apply as to any other page here. robots.txt is read and obeyed,
requests are rate limited per host, and we identify ourselves honestly.

## There is no public archive of past Grays sales

Three routes were checked on 29 September 2026, looking for a way to find what
past lots sold for.

**Their search shows live lots only.** `grays.com/search?keywords=landcruiser`
returns 32 results, every one of them counting down to a close. No closed lots,
no sold prices, and no filter for completed auctions.

**Their sitemap lists current inventory.** `motor-vehiclesmotor-cycles-lot-1`
holds 298 lot pages, all modified today and marked to change daily, from sale
numbers alongside the ones running now. It is what is for sale, not what has
been sold.

**A web search does reach past lot pages.** A closed lot page stays up and
keeps its sold price, so `site:grays.com` plus the item finds some of them. The
coverage is whatever a search engine happened to crawl while the lot was live,
which is patchy: a 2008 Landcruiser returned five past sales and a 2006
Mercedes ML320 returned none, though Grays has certainly sold both.

So past results can be read one at a time when a search engine knows about
them, and there is no index of them to work from. That is the constraint any
plan for auction evidence has to live inside.
