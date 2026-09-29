# 0020. Past auction results are the evidence triage runs on

Status: Accepted

Date: 29 September 2026

## Context

S5 gives each lot a rough resale range. Built on Brave search, it valued none
of the five real lots it was tried on.

| Lot | Comparables found | Combined weight | Range |
| --- | --- | --- | --- |
| 2008 Landcruiser GXL diesel | 3 | 0.72 | none |
| 2006 Mercedes ML320 diesel | 2 | 0.75 | none |
| 2015 Outlander Exceed diesel | 4 | 1.08 | none |
| 2011 Fiat 500 petrol | 4 | 1.20 | none |
| 2014 Nissan QASHQAI Ti petrol | 4 | 0.96 | none |

[matching-and-valuation.md](../../02-specs/matching-and-valuation.md) requires
at least three comparables with a combined weight of 1.5. Asking Brave for
twenty results instead of ten moved the weights to between 0.72 and 1.20 and
still valued none, because the model finds two to four usable comparables
either way and the rest are category and review pages.

The threshold is not the problem. Every comparable the open web returns is an
**advertised** price, which the spec weights at 0.6. A **sold** price is
weighted 0.95. Three sold comparables at near exact carry 2.42 and clear the
bar comfortably; five advertised ones barely reach it.

## What Grays publishes

A Grays catalogue page for a closed sale shows "Bidding closed" and no price
at all. Checked on sale 23502297: not one dollar figure on the whole page.

The lot page does show it:

> 25 September 2026 21:00 AEST
> Sold for
> $260
> The auction has ended.

So a hammer price and the date it happened are both public, one lot page at a
time.

## Decision

Triage values a lot against past auction results from Grays and Lloyds first,
and falls back to web listings only to fill out the evidence.

## Why

1. **It is sold evidence**, weighted 0.95 rather than 0.6, which is the
   difference between clearing the evidence threshold and not.
2. **It is the closest comparable there is.** The same auction house, the same
   buyers, the same condition of goods and the same market. A retail asking
   price on carsales is a different transaction from an auction hammer price,
   and the gap between them is exactly the margin a reseller works in.
3. **We are already cleared to read these pages**, by
   [site-access.md](../../02-specs/site-access.md) and decision record 0012.
   No new vendor, no account, nothing to wait for approval on.
4. **It carries a date**, so recency weighting has something to work with.
   Brave returns none, so every web comparable currently counts as current.

## What this costs

The price is only on the lot page, so results have to be gathered one lot at a
time rather than one sale at a time. That is a page fetch per lot of each past
sale harvested.

It is worth it because the harvest is shared. An auction result is public
information about a completed sale, so it is stored once, in `comparables`
with a `source_type` of `auction_result`, and every organisation and every
later analysis reads the same row. The cost falls on the first analysis that
needs it and on nobody after.

## Consequences

1. A stage that harvests completed sales from a platform, storing each result
   as a comparable with its hammer price and date.
2. Triage searches the stored results before it searches the web.
3. Web listings still have a place, as `advertised_used` evidence, for a lot
   with no auction history.
4. The premium matters here. A hammer price is not what the buyer paid, and
   database.md already notes auction results are "adjusted for premium". The
   schedule work in decision records 0015 and 0016 is what makes that
   adjustment possible.
5. Nothing in this record lowers the evidence threshold. It raises the quality
   of the evidence instead.
