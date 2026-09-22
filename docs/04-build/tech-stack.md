# Technology Stack

Confirm current pricing and limits for each service before build.

Source: MaxBid Project Workbook, tab 15 Tech Stack.

| Layer | Choice | Why | Alternative |
| --- | --- | --- | --- |
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui | Matches existing HSES Online skills | Remix |
| Tables | TanStack Table | Dense, sortable, filterable lot tables | AG Grid |
| Hosting | Vercel | Native Next.js hosting | Netlify |
| Database and auth | Supabase Postgres, Auth, Storage, pgvector | RLS for multi tenancy, vector search for product matching | Neon plus Clerk |
| Background jobs | Inngest or Trigger.dev | Durable steps, retries, fan out, schedules | Supabase Queues |
| AI | Claude API. Haiku class for triage, Sonnet class for deep analysis and vision | Strong vision and structured output | Model agnostic layer later |
| Page extraction | Firecrawl or Browserbase | Rendered pages without running our own browsers | Self hosted Playwright |
| PDF parsing | Text extraction with OCR fallback, then Claude structuring | Handles scanned catalogues | Claude PDF input directly |
| Web search | Brave Search API or SerpAPI | Predictable structured results | Claude web search tool |
| Marketplace data | eBay Browse API, Marketplace Insights if approved | Official access | Search API results |
| Routing | Google Routes API or Mapbox | Road distance for transport estimates | OpenRouteService |
| Email | Resend with React Email | Transactional emails and alerts | Postmark |
| Push | Web push through the progressive web app | Closing soon alerts on phones | SMS later |
| PDF generation | React PDF | Bid sheet exports | Headless browser render |
| Payments | Stripe Billing (phase 2) | Subscriptions, credits and top ups | Paddle |
| Monitoring | Sentry | Error tracking across app and jobs |  |
| Analytics | PostHog | Product analytics and feature flags | Plausible |
| Development | Claude Code and Codex, GitHub, GitHub Actions | Existing workflow |  |
| Testing | Vitest for calculator maths, Playwright for end to end | Bid maths must be tested to the cent |  |
| Fonts | next/font self hosting Barlow and Space Mono | No layout shift, no third party font requests |  |
| Monorepo | Turborepo with pnpm workspaces | Shared packages, cached builds, one repository | Nx |
| Component catalogue | Storybook with the test runner and a11y addon | Build and review components in isolation before pages | Ladle |
| Visual regression | Chromatic, or Playwright screenshot tests | Catches unintended visual changes per component | Decide in O16 |
| Code size limits | ESLint max-lines and max-lines-per-function rules | Keeps every file small and editable |  |
| Bundle budgets | size-limit and Next.js bundle analyzer in CI | Fails the build when a route grows past budget |  |
| Installable web app | Web app manifest with Serwist service worker | Offline bid view and home screen install |  |
| Agent rules | CLAUDE.md and AGENTS.md at repo root | Claude Code and Codex follow the same architecture rules |  |
| Styling | Tailwind CSS v4 with CSS variable tokens and restyled shadcn/ui | One token set drives site and app. Light theme only in V1 per decision record 0001 |  |
| Marketing content | MDX in the repo for static pages, database driven pages for guides and breakdowns | Version controlled copy, programmatic scale | Sanity or Payload CMS later |
| Social images | Next.js ImageResponse (Open Graph image generation) | Branded share cards per page |  |
| Search tooling | Google Search Console, Bing Webmaster Tools, IndexNow | Indexing and monitoring. Bing feeds several AI answer engines |  |
| Accessibility testing | axe core in Playwright runs and manual screen reader checks | WCAG 2.2 AA enforced in CI |  |
