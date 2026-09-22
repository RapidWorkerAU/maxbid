# Disclaimer and Message Library

Plain, factual and neutral. Values in square brackets are filled by the system. Legal review required before launch.

Source: MaxBid Project Workbook, tab 30 Disclaimers.

| ID | Placement | Trigger | Text |
| --- | --- | --- | --- |
| DS01 | Sign up and material terms change | Clickwrap | This platform gives estimates to support your decisions. It does not give valuations, financial advice or tax advice. Estimates are based on public information at the date checked and can be wrong. Inspect items and read the auction terms before bidding. You are responsible for your bids. |
| DS02 | Every lot detail footer | Always | Estimate only, based on the evidence listed and checked on [date]. Condition and working order have not been verified. |
| DS03 | Insufficient evidence | Lot has no defensible comparable | We could not find enough reliable evidence to estimate a resale value for this lot. Enter your own resale estimate to calculate a bid. |
| DS04 | Resale override | User enters own resale | This bid uses your resale estimate of [amount], not the system estimate of [amount]. System confidence does not apply to your figure. |
| DS05 | Above the limit bid | Proposed bid exceeds the limit bid | This bid is above your limit bid of [amount]. Estimated profit is below your minimum of [amount]. |
| DS06 | Above the break even bid | Proposed bid exceeds the break even bid | At this bid you would make an estimated loss of [amount]. |
| DS07 | Optimistic reliance | Target only met on optimistic value | Your profit target is only met at the optimistic resale value. That value needs good condition and strong demand. |
| DS08 | Specification mismatch | Higher or lower specification comparable | No exact match was found. This comparable has [more or fewer] features than the lot, so its price has been adjusted [down or up] by [percent]. |
| DS09 | Stale price | Checked more than seven days ago | This price was checked on [date]. Refresh to check current listings. |
| DS10 | GST note | Calculator panel | GST is calculated from your profile setting and the auction terms. This is not tax advice. Confirm your position with your accountant. |
| DS11 | Transport estimate | Transport line | Estimated from road distance of [km] at your rate. Actual quotes may differ. |
| DS12 | Premium fallback | Premium not extracted | We could not read the buyer's premium from this auction's terms. The platform default of [percent] is used. Check the auction terms. |
| DS13 | AI identification | Identification card | Identified by AI from the description and photos. Confirm before relying on it. |
| DS14 | Unconfirmed identification | Identification not confirmed | This identification has not been confirmed. Values may change when you confirm or correct it. |
| DS15 | Selling fees blank | Selling fees field empty | No selling fees entered. Your maximum bid may be higher than is safe. |
| DS16 | Export footer | Every PDF and CSV | Estimates generated on [date] using method version [version]. Not a valuation. Sources, tags and match levels are listed per lot. Verify before bidding. |
| DS17 | Excluded comparables | User excludes comparables | You excluded [number] comparables. The expected resale changed from [amount] to [amount]. |
| DS18 | User supplied comparable | User adds a comparable | Added by your organisation. Not independently verified. |
| DS19 | Method update | Newer method version released | A newer valuation method is available. This result uses version [version]. Recalculate to use the latest method. |
| DS20 | Accuracy page | Accuracy page header | Accuracy is measured against outcomes recorded by users for each category. Past accuracy does not guarantee future results. |
| DS21 | Triage figures | Triage table | Triage figures are rough estimates from a quick check. Run deep analysis before bidding. |
| DS22 | Submit for review | User submits a shared data correction | Thanks. Your correction applies to your organisation now. It will apply to everyone once reviewed. |
| DS23 | Spec sheet header and PDF footer | Every spec sheet | Specifications are taken from the sources linked beside each item. Model specifications describe the model, not this item, unless also listed under Observed on this lot or Auctioneer stated. Details we could not verify are marked Not verified and are not presented as fact. We recommend independent checks before bidding. |
| DS24 | Specification conflict | Sources disagree on a field | Sources disagree on this detail. Check the item or ask the auctioneer before relying on it. |
| DS25 | Not identified | Item cannot be identified | We could not identify this item from the description and photos, so no specifications have been added. Enter the brand and model if you know them. |
| DS26 | Evidence panel header | Every evidence panel | Prices are taken from the sources linked below on the dates shown. Advertised prices are asking prices, not sale prices. |
| DS27 | Cheapest currently advertised | Cheapest comparable figure | Asking price seen on [date]. It may have sold or changed since. |
| DS28 | New price | New price figure | Last published new price found on [date]. Current new pricing may differ. If not found: No published new price was found. |
| DS29 | Searched and not found panel | Panel header | These are the sources we checked. No result means we found nothing there, not that nothing exists. |
| DS30 | We cannot verify panel | Panel header | These details cannot be confirmed from a listing. We recommend inspecting the item or asking the auctioneer. |
| DS31 | Mobile bid view | Footer of every lot card | Estimates only. We recommend independent checks before bidding. |
| DS32 | Email and push alerts | Footer of every notification | Figures are estimates. Open the lot for sources and details. |
| DS33 | Match reason | Beside each AI match reason | AI generated from the listing details shown. |
| DS34 | Optional equipment checklist | Checklist footer | Options marked Not verified may or may not be fitted. Confirm before bidding. |
| DS35 | Standard recommendation phrase | Used wherever a check is recommended | We recommend independent checks before bidding. |

## Placement and style rules

| ID | Rule | Applies to | Detail |
| --- | --- | --- | --- |
| PR01 | Subtle by default | All notes | Muted text at 12px directly beneath the element it qualifies, with an info icon that opens the full text. No page banners. |
| PR02 | Warnings stand out | DS05, DS06, DS07, DS15, DS24 | Amber styling beside the figure they affect. Notes use muted grey. |
| PR03 | One note per section | All notes | The same note never repeats within one panel or card. |
| PR04 | Only one blocking message | DS01 | The clickwrap is the only disclaimer that interrupts the user. Everything else sits in context. |
| PR05 | Consistent phrasing | DS35 | Where a check is recommended, use DS35 word for word. |
| PR06 | Exports | DS16, DS23 | Every PDF and CSV carries DS16. Spec sheets also carry DS23. |

## Coverage map

| ID | Screen or element | Messages | Style |
| --- | --- | --- | --- |
| CM01 | Sign up and terms change | DS01 | Clickwrap |
| CM02 | Triage table | DS21 | Muted note under table header |
| CM03 | Lot detail | DS02 | Muted footer |
| CM04 | Identification card | DS13, DS14 | Muted note and badge |
| CM05 | Not identified lot | DS25 | Muted note beside entry field |
| CM06 | Spec sheet section | DS23, DS24, DS34 | Muted header, amber conflict flags, checklist footer |
| CM07 | Evidence panel | DS26, DS08, DS09, DS33 | Muted header, inline notes per comparable |
| CM08 | Cheapest advertised and new price | DS27, DS28 | Muted note under figure |
| CM09 | Searched and not found panel | DS29 | Muted header |
| CM10 | We cannot verify panel | DS30 | Muted header |
| CM11 | Insufficient evidence lot | DS03 | Muted note in resale field |
| CM12 | Calculator panel | DS10, DS11, DS12, DS15 | Muted notes, amber flags |
| CM13 | Bid slider and limits | DS04, DS05, DS06, DS07 | Amber warnings beside the figure |
| CM14 | User supplied and excluded comparables | DS17, DS18 | Muted notes |
| CM15 | Method update prompt | DS19 | Muted note |
| CM16 | Watchlist and mobile bid view | DS31 | Muted footer on each card |
| CM17 | Email and push notifications | DS32 | Footer |
| CM18 | Report a problem and corrections | DS22 | Confirmation message |
| CM19 | PDF bid sheet and CSV | DS16 | Footer |
| CM20 | PDF spec sheet | DS16, DS23 | Header and footer |
| CM21 | Accuracy page | DS20 | Page header |
