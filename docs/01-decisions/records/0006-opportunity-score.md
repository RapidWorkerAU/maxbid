# 0006 Opportunity score formula

Status: Accepted
Date: 22 September 2026
Decided by: Ashleigh Phillips

## Context

The opportunity score in docs/02-specs/matching-and-valuation.md was a fraction: rough target bid less current bid, divided by rough target bid, multiplied by a confidence factor. Two problems followed.

1. Early in a catalogue almost nothing has a bid on it, so nearly every lot scored the same near perfect score and the ranking said very little.
2. The fraction ignored the size of the prize. A $50 lot with no bids outranked a $50,000 lot with one bid, which is the opposite of what F15 asks for, because F15 ranks by likely margin.

The word capped was also used without saying what the cap was.

## Options considered

1. Keep the fraction and rely on the dollar tie break. The tie break only fires on an exact tie, so it almost never corrects the ranking.
2. Rank on dollars of headroom and adjust for confidence, then scale the result for display.

## Decision

1. **Headroom.** The rough target bid less the current bid. Where there is no current bid, use the opening bid. Where there is neither, use zero. Negative headroom counts as zero.
2. **Weighted headroom.** Headroom multiplied by the triage confidence factor: High 1.0, Medium 0.75, Low 0.5, and zero where there is not enough evidence.
3. **Displayed score.** Weighted headroom divided by the highest weighted headroom in that catalogue, multiplied by 100, rounded down. The score runs from 0 to 100 and the best lot in any catalogue scores 100.
4. **Ties.** The earliest closing time ranks first, because that lot needs the user's attention soonest.

The score is relative to the catalogue it belongs to. It compares lots within one auction and is not comparable across auctions.

## Consequences

1. The opportunity score section of docs/02-specs/matching-and-valuation.md is replaced.
2. F15 in docs/02-specs/features.md now reflects a dollar based ranking.
3. The score depends on the highest weighted headroom in the catalogue, so it is computed at stage S6 in docs/02-specs/pipeline.md once every lot has a rough valuation, rather than per lot at S5.
