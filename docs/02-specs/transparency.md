# Transparency Specification

Source: MaxBid Project Workbook, tab 29 Transparency.

## Provenance tags

| Tag | Definition | Examples |
| --- | --- | --- |
| Verified | A sold result or recorded outcome with a checkable source. | Auction realised price, marketplace sold listing, your recorded resale. |
| Extracted | Read directly from a source page without calculation. | Advertised price, auction premium rate, closing time. |
| Estimated | Calculated or inferred by the platform, including fallbacks. | Resale scenarios, transport, AI identification, premium fallback. |
| Your input | Entered or changed by a member of your organisation. | Resale override, repair cost, user supplied comparable. |
| AI generated label | An additional label shown alongside the tag on any identification, match reason, difference list or summary produced by AI. It never replaces the provenance tag. |  |

## Evidence display rules

**Every price.** Shows source name, link, date checked, provenance tag and match level.

**Data age.** Date checked on every price. Stale tag and refresh action after seven days.

**Searched and not found.** Every lot lists each source queried, the number of results and what was not found. Example: eBay 4 results, no exact match. Grays past results 0 results. Manufacturer site new price not found.

**Adjustments.** Any price adjustment is shown as original price, adjustment percentage, reason and adjusted price.

**Weights.** Each comparable's combined weight is visible in the evidence panel.

**How this was calculated.** Expander on every bid limit. Shows the resale scenario and its evidence summary, every cost line with its tag, premium and GST flags, the formula in words and the method version.

## We cannot verify

| Category | Items the platform cannot verify |
| --- | --- |
| All categories | Condition, working order, completeness, hidden damage, accuracy of the auction description, ownership and any money owing on the item. |
| Vehicles and trailers | Odometer accuracy, service history, registration status, finance owing (check the PPSR), accident history. |
| Machinery and plant | Operating hours, tooling and accessories included, electrical supply requirements, guarding and compliance, wear on critical components. |
| Power tools | Battery health, chargers and batteries included, motor wear. |
| Electronics and IT | Activation or account locks, battery health, data wiping, licences included. |
| Commercial kitchen | Gas and electrical compliance, refrigeration performance, parts availability. |
**Category list.** Category items are admin settings (tab 27). The general list always shows. Category items are added to it.

## Spec sheet source classes

| Source class | Meaning | How it is presented |
| --- | --- | --- |
| Model specifications | Published by the manufacturer, a dealer or a specification database for this model. | True of the model. Not confirmed for this unit. |
| Observed on this lot | Read from the lot photos, such as a data plate or a visible unit. | AI generated label. User can confirm. |
| Auctioneer stated | Taken from the auction listing. | Extracted. Not independently checked. |
| Not verified | Options, fitted units, hours or condition that no source confirmed for this lot. | Shown so gaps are visible. |
**Conflicts.** When sources disagree, both values show side by side with a conflict flag. The platform does not pick a winner.

**Optional equipment.** Known options for the model are listed and marked Observed, Stated, Absent or Not verified for this lot.

**Not identified.** If the item cannot be identified from text and photos, no specifications are added. The user can enter brand and model, tagged Your input, to trigger enrichment.

**No guessing.** The platform never infers a brand or model to fill a gap.

**Delivery.** Spec sheet section on lot detail and a downloadable PDF spec sheet. Enrichment runs in deep analysis and is included in the credit.

