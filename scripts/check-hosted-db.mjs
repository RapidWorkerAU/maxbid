// Confirms the hosted Supabase project has the schema the migrations describe.
//
// Reads the keys from apps/app/.env.local and never prints them. Read only:
// it counts rows and reads the terms version, and writes nothing.
//
//   node scripts/check-hosted-db.mjs

import { readFileSync } from 'node:fs';

function env() {
  const text = readFileSync('apps/app/.env.local', 'utf8');
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) map.set(match[1], (match[2] ?? '').trim());
  }
  return map;
}

const vars = env();
const url = vars.get('NEXT_PUBLIC_SUPABASE_URL');
const key = vars.get('SUPABASE_SECRET_KEY');

if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY is not set in apps/app/.env.local.');
  process.exit(1);
}

const TABLES = [
  'organisations',
  'profiles',
  'organisation_members',
  'cost_profiles',
  'org_settings',
  'user_preferences',
  'terms_versions',
  'terms_acceptances',
  'waitlist_signups',
  'auction_platforms',
  'auctions',
  'raw_extract',
  'lots',
  'lot_images',
  'analyses',
  'analysis_lots',
];

console.log(`Checking ${url}\n`);

let missing = 0;
for (const table of TABLES) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*&limit=0`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
  });
  const count = response.headers.get('content-range')?.split('/')[1] ?? '?';
  if (response.ok) {
    console.log(`  ok    ${table.padEnd(22)} ${count} rows`);
  } else {
    missing += 1;
    console.log(`  MISS  ${table.padEnd(22)} ${response.status}`);
  }
}

// The terms row the clickwrap needs, seeded by the terms migration.
const terms = await fetch(`${url}/rest/v1/terms_versions?select=version,is_material`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
console.log('\nterms_versions:', terms.ok ? JSON.stringify(await terms.json()) : terms.status);

// The functions the app calls. A 404 here means the migration did not land.
const rpc = await fetch(`${url}/rest/v1/rpc/is_org_member`, {
  method: 'POST',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ target_org: '00000000-0000-0000-0000-000000000000' }),
});
console.log('is_org_member:', rpc.status === 404 ? 'MISSING' : `present (${rpc.status})`);

console.log(missing === 0 ? '\nAll tables present.' : `\n${missing} tables missing.`);
process.exit(missing === 0 ? 0 : 1);
