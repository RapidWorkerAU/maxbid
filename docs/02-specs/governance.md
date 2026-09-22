# Governance

Source: MaxBid Project Workbook, tab 31 Governance.

## Method versioning

**Version format.** Major, minor and patch numbers. Major changes the maths or scoring approach. Minor changes weights or thresholds. Patch fixes errors without changing intended results.

**Release process.** Change proposed with evidence from outcome data, tested against recorded outcomes, approved, released with a changelog entry and a new method_versions row.

**Existing results.** Every valuation keeps the version that produced it. Users see a newer method prompt and choose when to recalculate. The old result stays viewable.

**Public changelog.** Every method release and data source change is published with a plain English summary.

## Correction review workflow

| Step | Stage | What happens |
| --- | --- | --- |
| 1 | Submit | User reports a problem or submits a correction with optional evidence. Their own organisation sees the change immediately. |
| 2 | Queue | If the change would alter shared data it creates a correction review. The submitting organisation is hidden from other users. |
| 3 | Review | Platform admin checks the evidence and approves, rejects or edits the correction. |
| 4 | Apply | Approved changes update the shared record with provenance recorded and an audit entry. |
| 5 | Notify | Submitter is told the outcome. Affected analyses in other organisations show a refreshed data notice, never a silent change. |

## Problem reports

**Where.** Report a problem on every lot, identification and comparable.

**Categories.** Wrong item, wrong price, broken link, wrong premium, other.

**Response targets.** Acknowledged automatically. Reviewed within two business days during internal use. Targets reset at commercial launch.

**Use.** Reports feed extractor fixes, correction reviews and method calibration.

## Accuracy publishing

**Minimum sample.** At least 30 recorded outcomes in a category before its accuracy is published.

**Measures.** Share of actual resales within 15 percent of expected resale, and share at or above conservative resale.

**Update frequency.** Monthly, stamped with method version and period.

**Categories below minimum.** Shown as Not enough data yet.

**Phase.** Internal tracking from the MVP. Public page at or after commercial launch.

## Admin setting changes

**Change log.** Every platform setting change records old value, new value, who, when and a required reason.

**Effect.** Applies to new analyses and valuations. Existing results keep the values stamped on them.

**Access.** Platform admins only. Ashleigh during internal use.

