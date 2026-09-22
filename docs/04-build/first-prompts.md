# First prompts for Claude Code

Run these in order, one at a time. Wait for each to finish and review the result before the next. Start each one in plan mode (Shift and Tab) so Claude Code shows its plan before writing code.

## Prompt 1. Orientation (no code)

Read AGENTS.md, then docs/README.md, then every document it links to. Do not write or change any code. When you have finished, tell me: what MaxBid is in five sentences; the rules you must follow on every task; any contradictions, gaps or unclear points you found between documents, with file names; and a proposed Week 1 plan split into small tasks that each fit one pull request. Wait for my approval.

## Prompt 2. Governance and quality setup

Following docs/04-build/workflow.md and docs/04-build/component-register.md, set up component governance. Add a status tag (draft, in-review, approved or changes-requested) to every story file and make sure Storybook's sidebar can filter by these tags. Add a Storybook overview page that lists every component from the register with its status. Add the ESLint rules max-lines 300 and max-lines-per-function 80 to both apps and packages/ui, excluding generated database types. Confirm pnpm check passes. Update the register for the three existing components (Button, StopLine, Wordmark) to In review.

## Prompt 3. First primitives

Build these primitives from the component register, one at a time, in packages/ui following docs/04-build/architecture.md and docs/03-design/design-system.md: Input, Toggle group, Money, MonoLabel, ProvenanceTag. For each one: stories for every state, 375px and 1440px, accessibility check passing, unit tests for any logic, tokens only. Set each to In review in the register and stop when all five are ready so I can review them in Storybook.

## Prompt 4. Remaining primitives

Build the remaining primitives in the register, in the same way as Prompt 3. Stop when they are ready for review.

## Prompt 5. First database migration

Following docs/02-specs/database.md and docs/02-specs/security-and-rls.md, write the first Supabase migration for organisations, profiles, organisation_members, cost_profiles, org_settings, user_preferences and terms tables, with row level security and the helper function is_org_member. Write automated tests proving that one organisation cannot read another organisation's data. Regenerate database types. Do not push the migration to the hosted project yet. Show me the plan first.

## Prompt 6. Sign in and app shell

Following docs/02-specs/features.md (Accounts features) and docs/03-design/screens.md, build email magic link and Google sign in with Supabase Auth, the organisation creation step, the terms acceptance screen and the AppShell section. Use only Approved components. Stop for review.

## After that

Continue through docs/04-build/roadmap.md one task at a time. Build composites only after the primitives they use are Approved, and pages only after their sections are Approved.
