# UX Standards

Source: MaxBid Project Workbook, tab 38 UX Standards.

## Try before sign up

**Flow.** Visitor pastes a supported catalogue URL on the homepage. If the auction is already triaged in shared data, show the top five lots with ranges and rough max bids. Remaining lots blurred behind sign up.

**New auctions.** Queue triage and ask for an email to send results. This builds the waitlist and controls cost.

**Limits.** Rate limited per hashed IP. Bot protection. Deep analysis never available anonymously.

## Onboarding

**Step 1.** GST registered yes or no, with a one line plain explanation.

**Step 2.** Base location for transport estimates.

**Step 3.** Profit target in dollars or percentage, with a sensible default.

**Guided first analysis.** Paste a catalogue or use a sample. Inline tips at triage, shortlist and the calculator. Tips dismiss permanently.

**Target.** Sign up to first triage result in under five minutes.

## Interface states

**Empty states.** Every empty screen explains what goes there and gives one clear action.

**Loading.** Skeletons shaped like the final content. Stop line loader for background jobs with stage names.

**Errors.** Say what happened, what we did and what the user can do. Never blame the user. Money related errors stay plain.

**Partial results.** Lots appear as they complete. Failed lots show retry and refund status.

**Offline and slow.** Mobile bid view caches the watchlist so figures remain visible with poor reception at auction yards.

## Interaction

**Keyboard.** J and K move between lots, S shortlists, W watchlists, forward slash searches, question mark shows shortcuts.

**Undo.** Exclusions, overrides and shortlist changes offer undo for ten seconds.

**Instant feedback.** Calculator changes update figures within 100ms.

**Touch.** Targets at least 44px on mobile. Bid view usable one handed.

**Microcopy.** Buttons say what they do: Analyse 12 lots (12 credits), not Submit.

## Accessibility (WCAG 2.2 AA)

**Contrast.** 4.5 to 1 for text and 3 to 1 for UI elements, checked on light pages and on navy panels.

**Status.** Never colour alone. Every zone and badge has a text label.

**Keyboard.** Every function reachable by keyboard with a visible focus ring.

**Screen readers.** Tables with proper headers, live regions for recalculated bid figures, labelled sliders with value text.

**Motion.** Reduced motion respected everywhere.

**Target size.** Minimum 24px targets per WCAG 2.2, 44px on mobile by our standard.

## Testing

**Usability rounds.** Five real resellers per round at the end of Weeks 4 and 7 and before public launch.

**Tasks.** Analyse a catalogue, shortlist, adjust costs, read the evidence, use the bid view.

**Measures.** Task success, time on task, errors and a confidence rating after reading a lot.

**Automated.** axe accessibility checks and Lighthouse budgets in CI.

