# Matching, Evidence and Confidence Logic

Starting weights. Calibrate against recorded outcomes during the MVP.

Source: MaxBid Project Workbook, tab 08 Matching Logic.

## Match levels

| Match level | Definition | Match weight | Price adjustment | Standard explanation text |
| --- | --- | --- | --- | --- |
| Exact | Same brand, model and material specification. | 1 | None | Exact match. Same brand, model and specification. |
| Near exact | Same model with a minor year or specification difference. | 0.85 | Small adjustment where the difference is known | Same model. Differs in year or a minor option. |
| Higher specification | Comparable has greater capacity, features or performance. | 0.6 | Adjust price downward | No exact match found. This comparable has more features, so it may overstate value. |
| Lower specification | Comparable has fewer features or lower capacity. | 0.6 | Adjust price upward | No exact match found. This comparable has fewer features, so it may understate value. |
| Similar alternative | Different brand or model with broadly comparable capability. | 0.4 | Adjust by brand tier where known | Different brand or model with similar capability. Treat as a guide only. |
| Insufficient evidence | No defensible comparable located. | 0 | Not used | We could not find a reliable comparable. Enter your own resale estimate to calculate a bid. |

## Evidence type weights

| Evidence type | Description | Evidence weight | Used for |
| --- | --- | --- | --- |
| Verified outcome (own organisation) | Actual resale recorded by the user's organisation. | 1 | Resale |
| Auction realised result | Hammer price from a past Grays, Pickles or Lloyds auction, adjusted for premium. | 0.95 | Resale floor and auction market |
| Marketplace sold listing | Completed sale on eBay or similar, where access is available. | 0.95 | Resale |
| Verified outcome (pooled, anonymised) | Outcomes from other organisations, anonymised. Later phase. | 0.85 | Resale |
| Used advertised listing | Current asking price for a used item. | 0.6 | Resale ceiling. Apply asking to selling discount. |
| User supplied comparable | Link or price added by the user's organisation. Private to that organisation. | 0.5 | Resale, that organisation only |
| New retail price | Current or last known new price. | 0 | Reference only. Not used for resale. |

## Recency decay

| Evidence age | Recency weight |
| --- | --- |
| 0 to 90 days | 1 |
| 91 to 180 days | 0.8 |
| 181 to 365 days | 0.6 |
| Over 365 days | 0.4 |

## Combined weight and resale scenarios

**Comparable weight.** Match weight multiplied by evidence weight multiplied by recency weight.

**Asking to selling discount.** Advertised used prices are reduced by a category default, starting at 10 percent, before weighting. Editable in admin.

**Conservative resale.** Weighted 25th percentile of adjusted comparable prices.

**Expected resale.** Weighted median of adjusted comparable prices.

**Optimistic resale.** Weighted 75th percentile of adjusted comparable prices.

**Minimum evidence.** At least three comparables with a combined weight of 1.5 or more before a scenario range is shown. Otherwise the lot is marked Low or Insufficient.

**Optimism flag.** If the user's profit target is only met on the optimistic scenario, the lot shows a visible warning.

## Confidence score (0 to 100)

| Component | Calculation | Weight |
| --- | --- | --- |
| Identification confidence | Model confidence in brand and model, raised to 100 when user confirmed. | 0.25 |
| Best match level | Weight of the best comparable's match level multiplied by 100. | 0.25 |
| Evidence volume | Combined comparable weight, capped at 5, scaled to 100. | 0.2 |
| Sold evidence share | Share of combined weight coming from sold or realised evidence. | 0.15 |
| Price agreement | 100 minus coefficient of variation of adjusted prices, floored at zero. | 0.15 |
|  | Total weight | 1 |

| Confidence label | Score band |
| --- | --- |
| High | 75 and above |
| Medium | 50 to 74 |
| Low | 25 to 49 |
| Insufficient | Below 25, or minimum evidence not met |

## Opportunity score for triage (0 to 100)

Set by decision record 0006. The score ranks lots by the dollars a user could make, adjusted for how much the evidence supports the estimate.

**Headroom.** The rough target bid less the current bid. Where there is no current bid, use the opening bid. Where there is neither, use zero. Negative headroom counts as zero.

**Weighted headroom.** Headroom multiplied by the triage confidence factor: High 1.0, Medium 0.75, Low 0.5, and zero where there is not enough evidence.

**Displayed score.** Weighted headroom divided by the highest weighted headroom in that catalogue, multiplied by 100, rounded down. The best lot in any catalogue scores 100.

**Tie break.** The earliest closing time ranks first, because that lot needs the user's attention soonest.

**Scope.** The score compares lots within one catalogue. It is not comparable across auctions, because it is scaled against the best lot in its own catalogue. It is calculated at pipeline stage S6, once every lot has a rough valuation.
