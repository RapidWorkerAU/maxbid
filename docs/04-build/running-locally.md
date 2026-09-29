# Running MaxBid locally

What to start, in what order, and the things that catch people out.

## Once, before anything

1. Copy `.env.example` to **both** `apps/web/.env.local` and `apps/app/.env.local`, and fill each one in. Both apps need the Supabase variables. The web app needs `SUPABASE_SECRET_KEY` as much as the app does, because the waitlist writes with it.
2. Run `pnpm check:env`. It says which variables are missing and what breaks without each one. It prints names, never values.

## Every time

**One terminal for the apps.**

```
pnpm dev
```

The public site runs on http://localhost:3000 and the product on http://localhost:3001.

**A second terminal for the job runner**, whenever you are working on the pipeline.

```
npx inngest-cli@latest dev -u http://localhost:3001/api/inngest
```

Its dashboard is at http://localhost:8288, and it shows every run step by step, which is the easiest way to see where a stage failed.

## Things that catch people out

**The Inngest endpoint answers Unauthorized.** Set `INNGEST_DEV=1` in `apps/app/.env.local`. When a signing key is present the SDK assumes hosted Inngest and demands a signed request, so it rejects the Dev Server. Restart the dev server afterwards, because this is read at startup rather than on reload.

**A server action fails with a plain message.** The message a user sees is deliberately plain, per CP11. The cause is in the terminal running `pnpm dev`, not the browser console.

**A hydration mismatch mentioning an attribute you do not recognise.** A browser extension added it before React loaded. Both root layouts carry `suppressHydrationWarning` for that reason. It is not a fault in the page.

**Changes to `.env.local` need a restart** for anything read at startup. Next reloads most variables, but not all of them, and never the Inngest mode.

## Checking what is really there

| Command | What it tells you |
| --- | --- |
| `pnpm check:env` | Which variables each app is missing |
| `node scripts/check-hosted-db.mjs` | Whether the hosted database has every table and function |
| `node scripts/show-waitlist.mjs` | Recent waitlist sign ups, with addresses masked |
| `node scripts/probe-extract.mjs "<url>"` | What Firecrawl returns for one page, so an extractor can be written against the real thing |

## The database

Migrations are applied to the hosted project with `supabase db push`. That is Ashleigh's to run, per rule 11.

There is no local database on this machine, because Docker Desktop needs WSL 2 and it is not installed. CI starts a real Postgres for every pull request and runs the row level security tests there, so the policies are still checked on every change.
