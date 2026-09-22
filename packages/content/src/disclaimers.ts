// Disclaimer and message library. Source: MaxBid workbook tab 30.
// Do not type disclaimer text anywhere else. Import it from here.

/** Sign up and material terms change. Trigger: Clickwrap */
export const DS01 = "This platform gives estimates to support your decisions. It does not give valuations, financial advice or tax advice. Estimates are based on public information at the date checked and can be wrong. Inspect items and read the auction terms before bidding. You are responsible for your bids.";

/** Every lot detail footer. Trigger: Always */
export const DS02 = "Estimate only, based on the evidence listed and checked on [date]. Condition and working order have not been verified.";

/** Insufficient evidence. Trigger: Lot has no defensible comparable */
export const DS03 = "We could not find enough reliable evidence to estimate a resale value for this lot. Enter your own resale estimate to calculate a bid.";

/** Resale override. Trigger: User enters own resale */
export const DS04 = "This bid uses your resale estimate of [amount], not the system estimate of [amount]. System confidence does not apply to your figure.";

/** Above absolute maximum. Trigger: Proposed bid exceeds limit */
export const DS05 = "This bid is above your absolute maximum of [amount]. Estimated profit is below your minimum of [amount].";

/** Above break even. Trigger: Proposed bid exceeds break even */
export const DS06 = "At this bid you would make an estimated loss of [amount].";

/** Optimistic reliance. Trigger: Target only met on optimistic value */
export const DS07 = "Your profit target is only met at the optimistic resale value. That value needs good condition and strong demand.";

/** Specification mismatch. Trigger: Higher or lower specification comparable */
export const DS08 = "No exact match was found. This comparable has [more or fewer] features than the lot, so its price has been adjusted [down or up] by [percent].";

/** Stale price. Trigger: Checked more than seven days ago */
export const DS09 = "This price was checked on [date]. Refresh to check current listings.";

/** GST note. Trigger: Calculator panel */
export const DS10 = "GST is calculated from your profile setting and the auction terms. This is not tax advice. Confirm your position with your accountant.";

/** Transport estimate. Trigger: Transport line */
export const DS11 = "Estimated from road distance of [km] at your rate. Actual quotes may differ.";

/** Premium fallback. Trigger: Premium not extracted */
export const DS12 = "We could not read the buyer's premium from this auction's terms. The platform default of [percent] is used. Check the auction terms.";

/** AI identification. Trigger: Identification card */
export const DS13 = "Identified by AI from the description and photos. Confirm before relying on it.";

/** Unconfirmed identification. Trigger: Identification not confirmed */
export const DS14 = "This identification has not been confirmed. Values may change when you confirm or correct it.";

/** Selling fees blank. Trigger: Selling fees field empty */
export const DS15 = "No selling fees entered. Your maximum bid may be higher than is safe.";

/** Export footer. Trigger: Every PDF and CSV */
export const DS16 = "Estimates generated on [date] using method version [version]. Not a valuation. Sources, tags and match levels are listed per lot. Verify before bidding.";

/** Excluded comparables. Trigger: User excludes comparables */
export const DS17 = "You excluded [number] comparables. The expected resale changed from [amount] to [amount].";

/** User supplied comparable. Trigger: User adds a comparable */
export const DS18 = "Added by your organisation. Not independently verified.";

/** Method update. Trigger: Newer method version released */
export const DS19 = "A newer valuation method is available. This result uses version [version]. Recalculate to use the latest method.";

/** Accuracy page. Trigger: Accuracy page header */
export const DS20 = "Accuracy is measured against outcomes recorded by users for each category. Past accuracy does not guarantee future results.";

/** Triage figures. Trigger: Triage table */
export const DS21 = "Triage figures are rough estimates from a quick check. Run deep analysis before bidding.";

/** Submit for review. Trigger: User submits a shared data correction */
export const DS22 = "Thanks. Your correction applies to your organisation now. It will apply to everyone once reviewed.";

/** Spec sheet header and PDF footer. Trigger: Every spec sheet */
export const DS23 = "Specifications are taken from the sources linked beside each item. Model specifications describe the model, not this item, unless also listed under Observed on this lot or Auctioneer stated. Details we could not verify are marked Not verified and are not presented as fact. We recommend independent checks before bidding.";

/** Specification conflict. Trigger: Sources disagree on a field */
export const DS24 = "Sources disagree on this detail. Check the item or ask the auctioneer before relying on it.";

/** Not identified. Trigger: Item cannot be identified */
export const DS25 = "We could not identify this item from the description and photos, so no specifications have been added. Enter the brand and model if you know them.";

/** Evidence panel header. Trigger: Every evidence panel */
export const DS26 = "Prices are taken from the sources linked below on the dates shown. Advertised prices are asking prices, not sale prices.";

/** Cheapest currently advertised. Trigger: Cheapest comparable figure */
export const DS27 = "Asking price seen on [date]. It may have sold or changed since.";

/** New price. Trigger: New price figure */
export const DS28 = "Last published new price found on [date]. Current new pricing may differ. If not found: No published new price was found.";

/** Searched and not found panel. Trigger: Panel header */
export const DS29 = "These are the sources we checked. No result means we found nothing there, not that nothing exists.";

/** We cannot verify panel. Trigger: Panel header */
export const DS30 = "These details cannot be confirmed from a listing. We recommend inspecting the item or asking the auctioneer.";

/** Mobile bid view. Trigger: Footer of every lot card */
export const DS31 = "Estimates only. We recommend independent checks before bidding.";

/** Email and push alerts. Trigger: Footer of every notification */
export const DS32 = "Figures are estimates. Open the lot for sources and details.";

/** Match reason. Trigger: Beside each AI match reason */
export const DS33 = "AI generated from the listing details shown.";

/** Optional equipment checklist. Trigger: Checklist footer */
export const DS34 = "Options marked Not verified may or may not be fitted. Confirm before bidding.";

/** Standard recommendation phrase. Trigger: Used wherever a check is recommended */
export const DS35 = "We recommend independent checks before bidding.";
