# MaxBid

MaxBid (maxbid.com.au) helps Australian resellers work out the most they should pay for a lot at auction. It reads a Grays, Pickles or Lloyds catalogue, ranks every lot, and for chosen lots finds comparable sales, adds every cost and calculates a target bid, an absolute maximum and a stop line.

The strategic project workbook (MaxBid_Project_Workbook.xlsx) is the source of truth for scope, decisions, data model and rules. Signed off designs are in the MaxBid design canvas: https://claude.ai/artifact/T6x3BarxFAz2nA7G7DyMAp (Chosen homepage and Main pages).

## Repository layout

1. apps/web is the public site at maxbid.com.au. Mostly static and server rendered.
2. apps/app is the product at app.maxbid.com.au. Installable web app. Never indexed.
3. apps/storybook is the component catalogue.
4. packages/tokens holds colours, fonts, spacing and radius. Nothing else defines them.
5. packages/ui holds every component: primitives, composites and sections.
6. packages/calc holds all bid maths. Pure TypeScript, fully tested.
7. packages/content holds every disclaimer and standard message (DS01 to DS35).
8. packages/db holds Supabase types, typed queries and RLS test helpers.
9. packages/config holds shared TypeScript settings.
10. supabase holds migrations, seed data and local config.

## Rules for every change

1. Before building any UI, search packages/ui and Storybook for an existing component and use it. If one nearly fits, extend it with a prop.
2. A new component is created in packages/ui with a story and a test first, then used in a page.
3. No file may exceed 300 lines. Aim for 150. Page files may not exceed 80 lines. Split a file before adding to it. Run pnpm check:size.
4. Never reimplement bid maths. Import it from @maxbid/calc.
5. Never type disclaimer text. Import it from @maxbid/content.
6. Use tokens only. No hex values or arbitrary Tailwind values in components.
7. Add use client only to the smallest interactive component that needs it.
8. Write mobile styles first. Check every story at 375px before 1440px.
9. Before finishing a task, run pnpm check. It runs the size check, lint, type check and tests.
10. Do not start building a feature until its design and decisions exist in the workbook. Ask if they do not.

## Writing rules for any text a user sees

1. Write complete sentences in plain, everyday Australian English.
2. Explain terms such as target bid, absolute maximum, stop line, comparable and buyer's premium the first time they appear on a page.
3. Say what every figure is, for example an estimated profit of $4,000.
4. Use active voice and say who does what.
5. No slang, metaphors or clever phrasing in explanations, instructions, warnings or disclaimers.
6. No dashes of any kind in copy. No keynote style contrasting sentences.

## Design rules (Blueprint)

1. Light pages with navy panels. Navy #0E2A47, drafting white #F4F7FA, line cyan #7FC8F8, marker yellow #FFD23F, pen blue #1B6FD1, ink #0E1B2B.
2. Barlow for headings and body. Space Mono for labels, lot numbers and data.
3. Marker yellow is only for the main action and the most you should bid figure. Never for status.
4. Status colours always carry a text label.
5. 2px corners, hairline borders, drawing sheet frames on navy panels, detail labels, leader dots.
6. WCAG 2.2 AA everywhere.

## Commands

1. pnpm dev runs both apps. pnpm dev:web or pnpm dev:app runs one.
2. pnpm storybook opens the component catalogue.
3. pnpm check runs every quality check.
4. pnpm db:start starts local Supabase (Docker Desktop must be running). pnpm db:types regenerates database types.
