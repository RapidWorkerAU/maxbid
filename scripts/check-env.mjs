// Checks that each app's .env.local has the variables it needs.
//
//   pnpm check:env
//
// Not part of pnpm check, because .env.local does not exist in CI. Run it
// before starting the dev servers. It prints names and never values.
//
// This exists because a missing SUPABASE_SECRET_KEY in apps/web produced
// "We could not add you just now" on the waitlist form, which told nobody
// anything. A missing variable should be found before it is used.

import { existsSync, readFileSync } from 'node:fs';

/** What each app cannot run without, and what it only needs for some features. */
const APPS = {
  'apps/web': {
    required: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      'SUPABASE_SECRET_KEY',
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_APP_URL',
    ],
    optional: [],
  },
  'apps/app': {
    required: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      'SUPABASE_SECRET_KEY',
      'NEXT_PUBLIC_APP_URL',
    ],
    optional: [
      'FIRECRAWL_API_KEY',
      'INNGEST_EVENT_KEY',
      'INNGEST_SIGNING_KEY',
      'INNGEST_DEV',
    ],
  },
};

/** Why each variable matters, so a failure says what breaks. */
const REASONS = {
  NEXT_PUBLIC_SUPABASE_URL: 'nothing can reach the database',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sign in and every read from the browser',
  SUPABASE_SECRET_KEY: 'server writes, including the waitlist and the pipeline',
  FIRECRAWL_API_KEY: 'fetching catalogue pages',
  INNGEST_EVENT_KEY: 'sending pipeline events to hosted Inngest, not needed for the Dev Server',
  INNGEST_SIGNING_KEY: 'hosted Inngest calling us back, not needed for the Dev Server',
  NEXT_PUBLIC_APP_URL: 'the link in a magic link email',
  NEXT_PUBLIC_SITE_URL: 'canonical URLs on the public site',
  INNGEST_DEV: 'set to 1 locally, or the SDK rejects the Inngest Dev Server as unsigned',
};

function read(path) {
  if (!existsSync(path)) return null;
  const map = new Map();
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) map.set(match[1], (match[2] ?? '').trim());
  }
  return map;
}

/**
 * Variables that must point at this machine, and not at a deployed site.
 *
 * This exists because both files held https://app.maxbid.com.au, so a magic
 * link asked Supabase to send the user to a domain that is not running. The
 * address was not in the Supabase allow list either, so Supabase quietly used
 * the project Site URL instead and the link landed on the wrong app.
 */
const MUST_BE_LOCAL = ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL'];

let failures = 0;

for (const [app, needs] of Object.entries(APPS)) {
  const path = `${app}/.env.local`;
  console.log(`\n${path}`);

  const vars = read(path);
  if (!vars) {
    console.error(`  FAIL  the file does not exist. Copy .env.example to ${path}.`);
    failures += 1;
    continue;
  }

  for (const name of needs.required) {
    const value = vars.get(name);
    if (!value) {
      console.error(`  FAIL  ${name} is missing. Without it: ${REASONS[name] ?? 'unknown'}.`);
      failures += 1;
      continue;
    }
    if (MUST_BE_LOCAL.includes(name) && !value.includes('localhost')) {
      console.error(
        `  FAIL  ${name} is ${value}, which is not this machine. ` +
          'Use http://localhost:3000 for the site and http://localhost:3001 for the app. ' +
          'The deployed domains belong in Vercel, not here.',
      );
      failures += 1;
      continue;
    }
    console.log(`  ok    ${name}`);
  }

  for (const name of needs.optional) {
    const note = vars.get(name) ? 'ok   ' : 'unset';
    console.log(`  ${note} ${name}${vars.get(name) ? '' : `  (${REASONS[name] ?? ''})`}`);
  }
}

console.log(
  failures === 0
    ? '\nEvery required variable is set, and the URLs point at this machine.'
    : `\n${failures} problem${failures === 1 ? '' : 's'} above. ` +
        'Fix each one in the .env.local file named, then restart the dev server.',
);
process.exit(failures > 0 ? 1 : 0);
