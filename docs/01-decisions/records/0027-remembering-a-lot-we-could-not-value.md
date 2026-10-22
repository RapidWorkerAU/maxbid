# 0027. Remembering a lot we could not value

Status: Accepted

Date: 22 October 2026

## Context

A lot that fails the minimum evidence rule stores no resale range. That is
right: F26 says a lot we cannot value shows no bid figure, so there must be no
range for a screen to read by accident, and decision record 0025's table
cannot hold a range that does not run upwards.

The effect was that nothing remembered the attempt. Every analysis of that
sale paid the search, the model call and up to four page fetches again, and
failed again for the same reason.

On the real Grays Perth sale, 8 of the 30 lots valued produced no range. Once
decision record 0024's crawler runs, **that is 8 lots re-attempted every
night, for as long as the sale is listed**, for an answer that has not
changed. Raised as O19 when the shared layer was built, and this record closes
it.

## Decision

An attempt that found too little evidence is recorded, and the lot is not
tried again by the same method for seven days.

`valuation_attempts` holds one row per lot per method version, with when we
tried and how much evidence we found.

Two things make the lot eligible again.

1. **Seven days pass.** A lot fails for want of comparables, and comparables
   arrive when the archive grows. Decision record 0021 makes accuracy a
   function of how many sales we have harvested, and that grows over weeks
   rather than hours, so trying again tonight would spend the same fetches to
   reach the same answer.
2. **The method version changes.** The same rule decision record 0025 uses for
   reusing a range: when we improve the method, every lot it failed on is
   worth another look, at once rather than after a wait.

Seven days is Claude's judgement rather than Ashleigh's instruction, chosen so
the cooling off period is long enough to outlast a nightly crawl and short
enough that a lot listed for a fortnight gets a second look. It is one
constant and changing it changes nothing else.

## Why not a row in triage_valuations

That table answers what a lot is worth, and its constraint says a range runs
upwards or it is not a range. A failed attempt is not a worth. Loosening the
constraint to hold one would make every reader of the table check for a range
that is not there, which is how a blank becomes a figure of nothing somewhere
down the line.

## What is kept, and why

The attempt records `comparable_count` and `combined_weight`, not just a
timestamp. That tells a lot that found almost enough evidence from one that
found none, which is the difference between a lot the growing archive will
rescue and a lot nothing will. It is also the only data we would have on why
valuations fail, and decision record 0021 makes that the question accuracy
turns on.

Any signed in user may read an attempt. F59 shows the working, and that we
looked and found too little is part of the working rather than something to
hide. Nobody but the background jobs may write one: a user saying we tried
would not make it true, and a user erasing an attempt would remove the reason
their own figures are blank.

## Consequences

1. S5 reads the recent attempts for its shortlist alongside the stored ranges,
   and leaves those lots alone.
2. A run reports how many lots it skipped for this reason, so a sale that
   valued nothing says why. A sale where every lot failed recently is a
   different thing from a sale with nothing to value.
3. A lot skipped this way shows no resale range and no maximum bid, exactly as
   it did before. Nothing on screen changes, because nothing about the lot has
   changed: we still cannot say what it is worth.
4. The nightly crawl becomes proportional to what is newly listed rather than
   to what is listed, which is what decision record 0024's fifth mitigation
   already claimed and could not deliver without this.
