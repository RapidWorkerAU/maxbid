# 0019. Usage caps the match level

Status: Accepted

Date: 29 September 2026

## Context

[matching-and-valuation.md](../../02-specs/matching-and-valuation.md) grades a
comparable on specification: capacity, features and performance. It says
nothing about usage, meaning kilometres on a vehicle or hours on a machine.

The first valuation run showed what that costs. Lot 0005 of the Grays Perth
sale is a 2008 Toyota Landcruiser GXL diesel, bid to $11,300. The search found
three comparables and the model graded one of them **exact**:

| Comparable | Price | Grade given |
| --- | --- | --- |
| 2008 Landcruiser GXL diesel wagon | $39,990 | exact |
| 2008 Landcruiser GXL diesel cab chassis | $51,490 | near exact |
| 2008 Landcruiser GXL diesel automatic 4x4 | $56,000 | near exact |

The resulting range was a conservative resale of $35,991 and an expected resale
of $46,341.

The lot has done **549,752 kilometres**. The comparables had not, and nothing
in the pipeline knew, because the catalogue card states the odometer and the
parser was dropping it. That is fixed separately.

Fixing the reading is not enough. Under the spec as written, a lot and a
comparable that agree on year, make, model, variant and fuel are an exact
match whatever their odometers say. On a vehicle, usage is usually the largest
single thing separating two otherwise identical listings.

The failure mode this creates is the worst kind for this product: a figure
that is wrong, well evidenced, and labelled as confident.

## Decision

A large usage difference caps the match level.

Where the comparable has done materially less than the lot, the match cannot
be better than **higher specification**, which the spec already defines as
"comparable has greater capacity, features or performance", weights at 0.6
rather than 0.95, and adjusts downward. Where the comparable has done
materially more, it caps at **lower specification**, which adjusts upward.

The model is given the lot's usage and asked to read each comparable's, to say
which is higher, and to name the difference in its reason.

## Why this rather than a rate per kilometre

A dollar adjustment per kilometre would be more precise if the rate were
right, and the rate is the problem. It varies by make, by age and by vehicle
type, we have no data to set it from, and a figure invented here would flow
straight into a bid figure looking like a fact.

Capping the match level reuses grading that already exists and is already
tested. It says a comparable is a poor guide without pretending to know by how
much, which is the honest position when we do not.

## Consequences

1. The lot's usage is included in what the model reads, so it can compare.
2. A comparable whose usage is unknown cannot be graded exact, because an
   unknown difference is not the same as no difference.
3. The reason shown to the user names the usage difference, so a figure can be
   checked rather than taken on trust.
4. The three components of confidence already fall when match levels fall, so
   a lot like this reports lower confidence without any new maths.
5. This is a reading of the spec rather than a change to it, so
   matching-and-valuation.md gains a section pointing here.
6. What counts as a large difference is a setting, not a constant. The right
   value is not knowable in advance and will differ by category.
