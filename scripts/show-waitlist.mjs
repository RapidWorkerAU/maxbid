// Shows the most recent waitlist sign ups, with email addresses masked.
//
//   node scripts/show-waitlist.mjs
//
// Read only. Reads the keys from apps/app/.env.local and never prints them.

import { readFileSync } from 'node:fs';

function value(key) {
  const text = readFileSync('apps/app/.env.local', 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)$`));
    if (match) return match[1].trim();
  }
  return null;
}

const url = value('NEXT_PUBLIC_SUPABASE_URL');
const key = value('SUPABASE_SECRET_KEY');
if (!url || !key) {
  console.error('Supabase URL or secret key missing from apps/app/.env.local.');
  process.exit(1);
}

const response = await fetch(
  `${url}/rest/v1/waitlist_signups?select=email,source,utm,created_at&order=created_at.desc&limit=10`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);

if (!response.ok) {
  console.error('Supabase answered', response.status, await response.text());
  process.exit(1);
}

const rows = await response.json();
console.log(`${rows.length} sign ups\n`);
for (const row of rows) {
  // An address somebody gave us before launch is not ours to print in full.
  const masked = String(row.email).replace(/^(.)[^@]*(@.*)$/, '$1***$2');
  console.log(`  ${masked}  source=${row.source ?? 'none'}  ${row.created_at}`);
}
