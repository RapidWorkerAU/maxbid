# 0026. How often a current bid is re-read

Status: Accepted

Date: 22 October 2026

## Context

Decision record 0024 moves the slow work off the request: a sale is read,
identified and valued before anybody asks about it. Its fifth consequence says
the current bid must still be refreshed, because a resale range a week old is
fine and a current bid from last night shown as current is not.

The label was built first, in pull request 53. `lots.bid_checked_at` records
when a bid was read and the screen says how long ago. Nothing re-read a bid,
so every analysis still showed a bid from whenever its catalogue was last
fetched. Ashleigh raised that gap, and this record closes it.

## What makes this affordable

**One catalogue page fetch returns every lot's bid on that page.** Bids are
parsed out of the catalogue, not read from individual lot pages.

| | Fetches |
| --- | --- |
| Re-read every bid in one 36 lot sale | about 1 |
| Identify and value one lot | 2 to 4 |

So the expensive work is per lot and the cheap work is per sale. That is the
split decision record 0024 relies on: identification and valuation run on a
schedule overnight, and bids can be re-read far more often without touching
the fetch budget that matters.

On the numbers in decision record 0024, 417 live vehicle lots across 21 live
sales, re-reading every sale costs about 21 fetches, which is under three
minutes at eight fetches a minute.

## What the evidence says about when bids move

Bids do not move evenly. On the Grays Perth sale of 29 September 2026 the
total **rose 51 per cent in its final six hours**, and one lot went from
$1,809 to $7,200. Decision record 0023 already relies on this: it is why a lot
is ranked on what it is worth rather than on the room above the current bid.

A single interval for every sale is therefore the wrong shape. It spends the
same effort on a sale closing in nine days as on one closing in an hour, and
the one closing in an hour is the only one where a stale figure misleads
somebody.

## Decision

A sale's bids are re-read on an interval set by how long it has left.

| Time until the sale closes | Bids re-read every |
| --- | --- |
| Up to 2 hours | 10 minutes |
| 2 to 24 hours | 30 minutes |
| 24 to 48 hours | 1 hour |
| More than 48 hours | 2 hours |

Set by Ashleigh. The shape follows the evidence above: attention is
concentrated where bids actually move.

Three rules decide the cases the table does not cover.

1. **A sale that has closed is never re-read.** A bid cannot change after the
   sale ends, and S7 already reads what each lot fetched. Without this rule
   every sale we have ever seen would be re-read forever.
2. **A sale with no known closing time is re-read every 30 minutes**, which is
   the general case in the table. We cannot tier what we cannot date, and 30
   minutes is the bar Ashleigh set for the ordinary case. The checked at
   sentence still states the truth either way.
3. **A lot whose bid has never been read is due now.** Null is not an old
   reading, it is no reading.

## What this costs, and the commitment it changes

Decision record 0024 listed "a sale is crawled once" among its mitigations.
**This record changes that**, and deliberately: a live sale is now fetched
repeatedly for as long as it runs. Ashleigh has weighed that.

What stays:

1. The eight fetches a minute limit, shared across every stage. The refresher
   is not exempt and takes its turn with everything else.
2. A cap on how many sales one run may read, so a backlog cannot starve
   extraction, valuation or the harvest of their share of the budget.
3. The oldest reading is re-read first, which is what the
   `lots_bid_checked_idx` index on `bid_checked_at nulls first` exists for.
4. robots.txt is read and obeyed, and we identify ourselves as MaxBidBot, as
   site-access.md requires.

The refresher reads one page per sale rather than one per lot, which is why
this is a far smaller load than the nightly valuation crawl despite running
constantly.

**Firecrawl bills per page.** At the two hour tier a sale costs 12 fetches a
day and at the ten minute tier 144, so the daily total depends on how many
sales are near closing. This needs checking against the plan before the
refresher is switched on in production, and is listed as O20.

## Consequences

1. A scheduled stage running every ten minutes, the finest interval in the
   table, which each time re-reads only the sales whose own interval has
   elapsed. One schedule, rolling, rather than four schedules.
2. The interval rule is pure and tested, because it is the whole decision and
   it must not be re-derived anywhere.
3. Opening an analysis re-reads its sale when that sale is due, so somebody
   looking at a list gets the freshest figure the tier allows rather than
   waiting for the next scheduled run.
4. A refresh that finds lots we do not hold writes them, per decision record
   0024's second scenario. Identifying and valuing them stays the crawler's
   job, so they appear as lots we have not worked out yet rather than not at
   all.
5. O20 raised: the per page cost of the refresher against the extraction
   plan's limits.
