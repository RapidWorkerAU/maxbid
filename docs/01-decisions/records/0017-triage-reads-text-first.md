# 0017. Triage reads the text first and the photo only when unsure

Status: Accepted

Date: 29 September 2026

## Context

F13 says triage identifies each lot "from text and the primary photo". S4 runs
across every lot of every catalogue, so whatever it costs is multiplied by the
size of the sale and then by every sale a user runs.

[unit-costs.md](../../02-specs/unit-costs.md) budgets **$0.02 per lot** for
triage, and that figure has to cover the search call in S5 as well, so the
identification has only part of it.

The first real catalogue gives a fair test of how much the photo is needed.
Its lot titles are already highly structured:

> 2015 Mitsubishi Outlander Exceed Diesel (WOVR-INSPECTED)
> 2013 Ford Focus Titanium Diesel
> 2003 Nissan 350Z Touring Petrol

Each carries year, make, model, variant and fuel, and the cards also carry
odometer, transmission and a written off vehicle marker. For vehicles, the
photo may confirm what the text already says while costing roughly three times
as much per lot.

That will not hold for every category. A pallet of mixed tools, a machine with
no model plate, or a title that is simply wrong are all cases where only the
photo tells the truth.

## Decision

Triage identifies a lot from its text first. Where the model returns low
confidence, the lot is sent again with its primary photo.

This meets F13, because the photo is still read wherever it would change the
answer. It is not the same as reading it every time.

## Consequences

1. Most lots cost one text call. Only the uncertain ones cost a second call
   with an image.
2. The confidence threshold that triggers the second pass is a setting, not a
   constant, because the right value is not knowable in advance.
3. Every call is written to `ai_runs` with its tokens and cost, so how often
   the second pass fires is measured rather than guessed at.
4. If the second pass fires on most lots in a category, reading the photo
   first for that category will be cheaper, and the figures will say so.
5. F13 is met but read differently from how it is written. Anyone reading F13
   alone would expect a photo on every lot, so this record is linked from it.
