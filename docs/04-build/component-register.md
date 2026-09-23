# Component register

This register is the sign off record for every component in packages/ui. It is the source of truth for component status.

## Status meanings

1. Not started. No code exists yet.
2. Draft. Code and stories exist but it is not ready for review.
3. In review. Claude Code has finished it, all checks pass and it is waiting for Ashleigh.
4. Approved. Ashleigh has reviewed it in Storybook and signed it off. Only Approved components may be used in pages.
5. Changes requested. Ashleigh has asked for changes. The notes column says what.

## Rules

1. Only Ashleigh changes a status to Approved or Changes requested.
2. Claude Code may move a component to Draft or In review, and must fill in the date.
3. Any change to an Approved component moves it back to In review.
4. The status tag in each story file must match this register.

## Register

| ID | Component | Layer | Used in | Status | Date | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| UI01 | Button | Primitive | Both | Approved | 23 September 2026 | Primary, secondary, ghost, danger, loading and disabled |
| UI02 | Input | Primitive | Both | Approved | 23 September 2026 | Text, number, URL and email. Label, hint and error. Mono variant |
| UI03 | Toggle group | Primitive | Both | Approved | 23 September 2026 | Named group with aria-pressed on every choice |
| UI04 | Money | Primitive | Both | Approved | 23 September 2026 | AUD, tabular figures, four sizes. Rounding from decision record 0003 |
| UI05 | MonoLabel | Primitive | Both | Approved | 23 September 2026 | Uppercase Space Mono data label. Detail B04 |
| UI06 | ProvenanceTag | Primitive | Both | Approved | 23 September 2026 | Verified, Extracted, Estimated, Your input |
| UI07 | AiLabel | Primitive | Both | Approved | 23 September 2026 | AI generated marker. Sits beside the provenance tag, never replaces it |
| UI08 | MatchBadge | Primitive | Both | Approved | 23 September 2026 | Six match levels. Solid, outlined and grey, each with its text label |
| UI09 | ConfidenceBadge | Primitive | Both | Approved | 23 September 2026 | Four bands worked out from the score, so label and number agree |
| UI10 | ZoneLabel | Primitive | Both | Approved | 23 September 2026 | On target, Below target, Loss risk. Solid and quiet tones |
| UI11 | InfoNote | Primitive | Both | Approved | 23 September 2026 | Muted 12px note with info icon. Text comes from packages/content |
| UI12 | StopLine | Primitive | Both | Approved | 23 September 2026 | Three thicknesses. Decorative unless given a label |
| UI13 | SheetFrame | Primitive | Both | Approved | 23 September 2026 | Double inset cyan frame on a navy panel. Detail B01 |
| UI14 | TitleBlock | Primitive | Web | Approved | 23 September 2026 | Label and value cells as a description list. Detail B02 |
| UI15 | DetailLabel | Primitive | Both | Approved | 23 September 2026 | Navy tab label such as Detail A. Detail B03 |
| UI16 | LeaderLine | Primitive | Both | Approved | 23 September 2026 | Label, dotted leader and figure. Detail B05 |
| UI17 | LineIcon | Primitive | Both | Approved | 23 September 2026 | Twelve icons at 1.4px stroke in pen blue. Detail B07 |
| UI18 | Wordmark | Primitive | Both | Approved | 23 September 2026 | Three sizes, light and on navy |
| UI19 | BidRail | Composite | Both | Not started |  |  |
| UI20 | BidSlider | Composite | App | Not started |  |  |
| UI21 | BidLimits | Composite | Both | Not started |  |  |
| UI22 | EvidenceRow | Composite | App | Not started |  |  |
| UI23 | PriceLine | Composite | Both | Not started |  |  |
| UI24 | SpecTable | Composite | Both | Not started |  |  |
| UI25 | OptionChecklist | Composite | App | Not started |  |  |
| UI26 | DetailCard | Composite | Both | Not started |  |  |
| UI27 | TimeRemainingBar | Composite | Both | Not started |  |  |
| UI28 | SplitBar | Composite | Web | Not started |  |  |
| UI29 | PriceChart | Composite | Web | Not started |  |  |
| UI30 | PlanPanel | Composite | Web | Not started |  |  |
| UI31 | CostSummary | Composite | App | Not started |  |  |
| UI32 | OverrideMarker | Composite | App | Not started |  |  |
| UI33 | LotRow | Composite | App | Not started |  |  |
| UI34 | StatusLine | Composite | Both | Not started |  |  |
| UI35 | EmailCapture | Composite | Web | Not started |  |  |
| UI36 | SiteHeader | Section | Web | Not started |  |  |
| UI37 | SiteFooter | Section | Web | Not started |  |  |
| UI38 | SheetHero | Section | Web | Not started |  |  |
| UI39 | SampleResults | Section | Web | Not started |  |  |
| UI40 | CategoryTiles | Section | Web | Not started |  |  |
| UI41 | ClosingList | Section | Web | Not started |  |  |
| UI42 | HowItWorks | Section | Web | Not started |  |  |
| UI43 | SignupPanel | Section | Web | Not started |  |  |
| UI44 | PricingPlans | Section | Web | Not started |  |  |
| UI45 | GuideLayout | Section | Web | Not started |  |  |
| UI46 | MethodSteps | Section | Web | Not started |  |  |
| UI47 | AppShell | Section | App | In review | 23 September 2026 | Sidebar on desktop, bottom tab bar on mobile, safe area aware |
| UI48 | TriageTable | Section | App | Not started |  |  |
| UI49 | LotDetail | Section | App | Not started |  |  |
| UI50 | BidView | Section | App | Not started |  |  |
| UI51 | ChangesSummary | Composite | App | Not started |  | Added for F54 |
| UI52 | SearchedNotFoundPanel | Composite | App | Not started |  | Added for F57 |
| UI53 | CannotVerifyPanel | Composite | App | Not started |  | Added for F58 |
| UI54 | ReportProblem | Composite | App | Not started |  | Added for F64 |
