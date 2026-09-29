# 0023. Rank on what a lot is worth, not on headroom against the current bid

Status: Accepted

Date: 29 September 2026

Amends decision record 0006.

## Context

Decision record 0006 ranks a catalogue on **headroom**: the rough target bid
less the current bid, weighted by confidence. It was decided in September
against reasoning about the shape of the formula, because no real sale had
been watched from end to end.

One now has. The Grays Perth motor vehicle sale of 29 September 2026 was
extracted six hours before it closed, and every lot's result was recorded
afterwards.

**Every one of the 36 lots sold, and the total rose 51 per cent** in those last
hours, from $112,589 to $169,998.

| Lot | Bid when we looked | Sold for | Rise |
| --- | --- | --- | --- |
| 2015 Outlander Exceed | $1,809 | $7,200 | 298% |
| 2014 Mazda CX-5 Maxx Sport | $3,100 | $6,266 | 102% |
| 2019 RAM 1500 Laramie | $22,100 | $40,500 | 83% |
| 2008 Landcruiser GXL | $11,300 | $12,800 | 13% |
| 2003 Nissan 350Z Touring | $6,600 | $6,600 | 0% |

Ashleigh put it plainly: people wait until the end so they can be the last to
bid. That is not a surprise about this sale, it is how timed auctions work.

So the current bid, at the moment a catalogue is analysed, carries almost no
information about what a lot will fetch. It mostly records how early we looked.

Headroom subtracts that number. On this sale it would have ranked the Outlander
near the top, on the strength of a $1,809 bid that meant nothing, above lots
worth far more.

## Decision

The opportunity score ranks on **the rough target bid**, weighted by
confidence. The current bid is not subtracted.

1. **Value.** The rough target bid, which is the most a lot is worth paying by
   the user's own figures.
2. **Weighted value.** Value multiplied by the triage confidence factor: high
   1.0, medium 0.75, low 0.5, and zero where there is not enough evidence.
3. **Displayed score.** Weighted value divided by the highest weighted value in
   that catalogue, multiplied by 100, rounded down. The best lot in any
   catalogue still scores 100.
4. **Ties.** The earliest closing time ranks first, unchanged.

The current bid is still shown on every row. It tells the user where the
bidding has got to, which is worth knowing. It no longer decides the order.

## What this gives up

Decision record 0006 was answering a real question: a $50 lot with no bids
should not outrank a $50,000 lot. Ranking on value answers that too, because
value scales with the lot.

What it loses is the case where a genuinely valuable lot has drawn no interest
and is therefore a bargain. That case exists. It cannot be told apart from a
lot nobody has got to yet, using a figure taken hours before the close, which
is the only figure triage has.

## Consequences

1. The opportunity score section of
   [matching-and-valuation.md](../../02-specs/matching-and-valuation.md) is
   replaced again, and decision record 0006 is marked amended.
2. F15 ranks by what a lot is worth rather than by likely margin over the
   current bid.
3. The score still needs a rough target bid, so it still needs the
   organisation's profit target. Decision record 0022 stands.
4. How much a lot rises between analysis and close is now measurable, because
   `lots` holds both the bid we saw and the price it fetched. When the archive
   holds enough sales, that becomes a real answer to the question this record
   works around, and this record should be revisited then.
