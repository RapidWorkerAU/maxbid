# 0021. MaxBid keeps its own archive of auction results

Status: Accepted

Date: 29 September 2026

## Context

Decision record 0020 settled that triage values a lot against past auction
results, because a sold price is weighted 0.95 against an asking price at 0.6
and three of them clear the evidence threshold where five listings barely do.

Finding them turned out to be the problem. Three routes were checked and
written up in [site-access.md](../../02-specs/site-access.md):

1. Grays' own search returns live lots only. No closed lots, no sold prices,
   no filter for completed auctions.
2. Grays' sitemap is current inventory, marked to change daily.
3. A web search does reach past lot pages, because a closed lot keeps its page
   and its price. Coverage is whatever a search engine crawled while the lot
   was live, which is patchy: a 2008 Landcruiser returned five past sales and
   a 2006 Mercedes ML320 returned none, though Grays has certainly sold both.

Measured across five real lots, that gave one range out of five.

There is no index of past sales to work from, and no vendor sells one for the
Australian auction market.

## Decision

MaxBid records the result of every lot it has ever extracted, and values
against its own archive first.

When a sale closes, every lot from it is revisited and what it sold for is
stored as a comparable. The lot URLs are already in the database from
extraction, so this needs no searching at all: one pass per sale, one fetch
per lot, no guessing about coverage.

## Why this rather than searching harder

Searching cannot be made reliable. It depends on what a third party crawled
months ago, and no amount of work on our side changes that. Two lots of the
same model returned five results and none for reasons we cannot see or fix.

Revisiting a sale we already read is complete by construction. Every lot we
extracted gets a result, or a record that it did not sell, which is itself
worth knowing.

It also compounds. Every analysis makes the next one better, and the archive
is worth more the longer it runs. Nothing else on the list has that shape: the
web search is as good today as it will ever be.

## What it costs

One page fetch per lot, once, after the sale closes. The same fetch also
confirms the premium and the final bid count.

That is the same order of cost as triage already pays, and it is paid once per
lot ever rather than once per lot per analysis. A result is public information
about a completed sale, so it is shared across every organisation.

## Consequences

1. `auctions` records when its results were harvested, so a sale is not
   revisited twice and an interrupted harvest can be finished.
2. A stage that runs after a sale closes, reads each lot page and stores the
   result as a comparable with a dated snapshot.
3. A lot that did not sell is recorded as such rather than skipped silently.
   "This model has failed to sell three times" is evidence about demand.
4. Nothing is valued only against the archive at first, because the archive
   starts empty. Web search stays as the fallback it already is.
5. The archive is only as broad as the catalogues MaxBid has read. Early
   analyses see little benefit, and that is the price of the compounding.
