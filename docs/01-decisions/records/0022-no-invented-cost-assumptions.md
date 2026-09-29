# 0022. No bid figure rests on a number the user did not choose

Status: Accepted

Date: 29 September 2026

## Context

A cost profile holds the profit target, the minimum acceptable profit,
transport and repairs. Every bid figure depends on all of them: the target bid
is the net resale less the costs less the target profit, divided by the cost of
each dollar of hammer price.

Nothing creates a cost profile today, so `cost_profiles` is empty and no bid
figure can be worked out at all. That blocks the maximum bid, and it blocks the
opportunity score as well, because decision record 0006 ranks on the rough
target bid less the current bid.

The obvious fix is to ship sensible defaults. The question is whose sensible.

## Decision

A new organisation gets a cost profile with **nothing filled in**. No default
profit target, no default minimum, no transport rate, no repairs percentage.

The user is asked for their figures before their first analysis, which is what
screen SC16 is for. Until they answer, no bid figure is shown.

## Why

**A default profit target is a guess about someone's business.** Two thousand
dollars is a good margin on a car and a poor one on a truck. A reseller who
never looked at the setting would see bid figures calculated against our
opinion of their business, presented with the same confidence as the figures
calculated against their own.

**Every cost only ever reduces a bid figure.** A transport rate we invented too
low, or a repairs percentage too small, produces a maximum bid that is too
high. That is the dangerous direction to be wrong in: too low loses a lot, too
high loses money.

**An unset cost is visible; an invented one is not.** A line marked "not set"
asks a question. A line reading $150 answers one nobody asked, and looks like
it came from somewhere.

## Consequences

1. Organisation creation makes an empty cost profile rather than a populated
   one, so there is something to edit and nothing to unlearn.
2. Every cost line records whether it has been set, distinctly from being zero.
   A transport cost of zero is a decision; an unset one is not.
3. No bid figure is shown for a lot whose profile has no profit target. The
   screen says which setting is missing and links to it, rather than showing a
   figure with a caveat.
4. The opportunity score cannot rank a catalogue until the organisation has a
   profit target, because the score is built on the target bid. Triage still
   shows what each lot is and what it is worth, which is useful on its own.
5. Onboarding, SC16, becomes required rather than optional. A user who skips it
   has an app that will not calculate.
6. This is stricter than CS28 to CS30, which name defaults for profit mode and
   targets. Those defaults are what the settings screen offers as a starting
   point, not what an organisation silently begins with.
