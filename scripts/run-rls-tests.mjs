// Runs the row level security tests against local Supabase.
//
// These are kept out of `pnpm check` on purpose. They need Docker and a
// running database, and check is meant to stay fast. CI runs them in their own
// job on every pull request, because R11 is scored impact 5.

import { execFileSync, spawnSync } from 'node:child_process';

function supabaseStatus() {
  try {
    const out = execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(out);
  } catch {
    console.error(
      'Local Supabase is not running.\n' +
        'Start Docker Desktop, then run pnpm db:start, then try again.',
    );
    process.exit(1);
  }
}

const status = supabaseStatus();

// The key names have changed between CLI versions, so accept the ones we know.
const pick = (...names) => names.map((n) => status[n]).find(Boolean);

const env = {
  ...process.env,
  SUPABASE_URL: pick('API_URL', 'api_url'),
  SUPABASE_ANON_KEY: pick('ANON_KEY', 'anon_key', 'PUBLISHABLE_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: pick('SERVICE_ROLE_KEY', 'service_role_key', 'SECRET_KEY'),
};

for (const name of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!env[name]) {
    console.error(`Could not read ${name} from supabase status. Keys seen: ${Object.keys(status).join(', ')}`);
    process.exit(1);
  }
}

const result = spawnSync('pnpm', ['--filter', '@maxbid/db', 'exec', 'vitest', 'run'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
