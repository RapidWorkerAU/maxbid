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
| UI01 | Button | Primitive | Both | Not started |  |  |
| UI02 | Input | Primitive | Both | Not started |  |  |
| UI03 | Toggle group | Primitive | Both | Not started |  |  |
| UI04 | Money | Primitive | Both | Not started |  |  |
| UI05 | MonoLabel | Primitive | Both | Not started |  |  |
| UI06 | ProvenanceTag | Primitive | Both | Not started |  |  |
| UI07 | AiLabel | Primitive | Both | Not started |  |  |
| UI08 | MatchBadge | Primitive | Both | Not started |  |  |
| UI09 | ConfidenceBadge | Primitive | Both | Not started |  |  |
| UI10 | ZoneLabel | Primitive | Both | Not started |  |  |
| UI11 | InfoNote | Primitive | Both | Not started |  |  |
| UI12 | StopLine | Primitive | Both | Not started |  |  |
| UI13 | SheetFrame | Primitive | Both | Not started |  |  |
| UI14 | TitleBlock | Primitive | Web | Not started |  |  |
| UI15 | DetailLabel | Primitive | Both | Not started |  |  |
| UI16 | LeaderLine | Primitive | Both | Not started |  |  |
| UI17 | LineIcon | Primitive | Both | Not started |  |  |
| UI18 | Wordmark | Primitive | Both | Not started |  |  |
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
| UI47 | AppShell | Section | App | Not started |  |  |
| UI48 | TriageTable | Section | App | Not started |  |  |
| UI49 | LotDetail | Section | App | Not started |  |  |
| UI50 | BidView | Section | App | Not started |  |  |
| UI51 | ChangesSummary | Composite | App | Not started |  | Added for F54 |
| UI52 | SearchedNotFoundPanel | Composite | App | Not started |  | Added for F57 |
| UI53 | CannotVerifyPanel | Composite | App | Not started |  | Added for F58 |
| UI54 | ReportProblem | Composite | App | Not started |  | Added for F64 |
