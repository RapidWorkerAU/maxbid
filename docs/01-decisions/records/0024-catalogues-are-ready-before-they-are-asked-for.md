# 0024. Catalogues are ready before anybody asks for them

Status: Proposed

Date: 13 October 2026

## Context

Analysing a catalogue takes about forty minutes. Measured on a real 36 lot
Grays sale, the time splits like this:

| Stage | Time |
| --- | --- |
| Fetch and parse the catalogue | seconds |
| Identify every lot | about two minutes |
| Value thirty lots | about forty minutes |

Almost all of it is the valuation, and almost all of that is page fetches,
which the extraction service caps at eight a minute. Decision record 0021
already cut the fetches by reading our own archive first, and PR 41 cut them
again by valuing only the lots worth valuing. Neither changes the shape of the
problem: a person pastes a link and waits.

A sale closing tonight cannot be analysed tonight.

## What this record rests on

**Most of the work does not depend on who is asking.**

| | Personal to the buyer? |
| --- | --- |
| Reading the catalogue into lots | No |
| The buyer's premium schedule | No |
| What a lot is: make, model, year, condition | No |
| What it is worth to resell | No |
| The most they should bid | **Yes**: their profit target, GST position and costs |
| Where it ranks for them | **Yes**: worked out from their bid figure |

A 2015 Mitsubishi Outlander is a 2015 Mitsubishi Outlander for everybody, and
it resells for the same money whoever bought it. Only the last two rows differ
by organisation, and both are arithmetic with no network in them.

The database already treats auctions and lots as shared, for exactly this
reason. Identifications and resale ranges are stored per analysis, which is an
accident of the order things were built in rather than a decision.

**The auction houses publish a list of everything they have.** Grays' sitemap
holds every live lot, updated daily. On 13 October 2026 the vehicle sitemap
held 417 lots across 21 live sales. Nothing has to be searched for.

## Decision

MaxBid crawls the sites it reads on a schedule, and has every live lot parsed,
identified and valued before anybody asks about it.

A pasted link then becomes a lookup, a refresh of the current bids, and a sum.

1. **Nightly.** Read each category sitemap. For any sale not seen before,
   fetch the catalogue, parse the lots, and read the premium schedule from one
   lot page.
2. **Then.** Identify every lot, and work out a resale range for every lot,
   using the archive first and the web only where the archive cannot answer.
3. **On request.** Refresh the current bids from the catalogue page, work out
   the person's own figures from the stored resale range, rank and show.

Identifications and resale ranges move from the analysis to the lot, so they
are computed once and read by everybody. A user may still correct either, and
their correction belongs to them.

This is a mechanism, not a feature. Nothing in the interface mentions it.

## The scenarios

**A sale crawled last night.** Everything stored. Refresh the bids, compute
their figures, show the list. Seconds. This is the common case.

**A sale crawled, but lots have been added since.** The bid refresh finds lots
we do not hold. Only those are extracted and valued. The other thirty nine are
instant.

**A sale posted this morning, before tonight's crawl.** Nothing stored, so it
runs as it does today, except the archive answers more of it than it used to.
Lots are identified first so the list appears populated, and the figures fill
in behind it.

**A site we do not crawl.** Lloyds, or anywhere we have no arrangement with.
Entirely on demand, exactly as now. This path does not go away and is what
makes the product work on a catalogue nobody expected.

**A sale that has closed.** We hold everything, plus what every lot actually
sold for. Nothing to fetch.

## What this costs, and the risk in it

Pre valuing every lot means fetching pages for lots nobody may ever look at.
At 417 vehicle lots and two to four fetches each, that is roughly two and a
half hours of fetching a night for one category.

Today we read a page because somebody asked for it. This reads pages
speculatively, and that is a real increase in what we take from sites that owe
us nothing. Ashleigh has weighed that and chosen it, and the mitigations are
part of the decision rather than an afterthought:

1. The rate limit stays, and is shared across every stage. Nothing crawls
   faster because it is a crawler.
2. The crawl runs overnight in Australian hours, when the sites are quietest.
3. robots.txt is read and obeyed on every host, every time, as it is now. A
   host that will not tell us its rules is still not fetched.
4. We identify ourselves honestly as MaxBidBot with a contact address, as
   site-access.md requires. Nothing here hides what we are.
5. A sale is crawled once. The nightly job skips what it has already read, so
   the cost is proportional to what is newly listed rather than to what is
   live.

## Consequences

1. A migration moving identifications and resale ranges from the analysis to
   the lot, with a per organisation override for a user's own correction.
2. A scheduled stage that reads the sitemaps and queues unseen sales.
3. S5 reads a stored resale range before working one out.
4. Submitting a URL becomes a lookup and a bid refresh rather than a full
   extraction.
5. The current bid must be refreshed on every request. A resale range a week
   old is fine, because resale values do not move daily. A current bid from
   last night shown as current is misleading, and F60 already asks for a
   checked at label.
6. Cost per analysis falls for everybody after the first, which is what
   unit-costs.md already assumes when it shares extraction across
   organisations. It now shares the identification and the valuation too.
7. The archive fills faster, because every live sale is read rather than only
   the ones somebody asked about. Decision record 0021 makes accuracy a
   function of how many sales we have seen, so this improves accuracy as a
   side effect rather than as a separate piece of work.
