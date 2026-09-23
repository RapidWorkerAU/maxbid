// Fetches one page through Firecrawl and shows what comes back.
//
// A research tool, not product code. It exists so an extractor can be written
// against a real page rather than a guess, and it is useful again whenever a
// site changes shape.
//
//   node scripts/probe-extract.mjs "https://www.grays.com/sale/..."
//
// Reads FIRECRAWL_API_KEY from apps/app/.env.local. Obeys robots.txt, per
// rule 1 of docs/02-specs/site-access.md.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const USER_AGENT = 'MaxBidBot/1.0 (+https://maxbid.com.au/bot)';
const url = process.argv[2];

if (!url) {
  console.error('Give it a URL:\n  node scripts/probe-extract.mjs "https://www.grays.com/sale/..."');
  process.exit(1);
}

function apiKey() {
  try {
    const env = readFileSync('apps/app/.env.local', 'utf8');
    const line = env.split(/\r?\n/).find((l) => l.startsWith('FIRECRAWL_API_KEY='));
    const key = line?.slice('FIRECRAWL_API_KEY='.length).trim();
    if (key) return key;
  } catch {
    // fall through
  }
  console.error('FIRECRAWL_API_KEY is not set in apps/app/.env.local.');
  process.exit(1);
}

// A deliberately strict robots check: anything disallowed stops the probe.
// Grays resets connections at random, so this retries before giving up. A
// failure to read robots.txt stops the probe: not knowing the rules is not
// permission to proceed.
async function readRobots(origin) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(origin + '/robots.txt', { headers: { 'User-Agent': USER_AGENT } });
      if (response.status === 404) return '';
      if (response.ok) return await response.text();
      console.error('robots.txt answered ' + response.status + ', retrying...');
    } catch {
      console.error('robots.txt connection reset, attempt ' + attempt + ' of 5...');
    }
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
  console.error('Could not read robots.txt after five attempts. Not fetching.');
  process.exit(1);
}

async function assertAllowed(target) {
  const { origin, pathname } = new URL(target);
  const text = await readRobots(origin);

  let active = false;
  const disallow = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split('#')[0]?.trim() ?? '';
    const [field, ...rest] = line.split(':');
    const key = field?.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') active = value === '*' || value.toLowerCase() === 'maxbidbot';
    else if (key === 'disallow' && active && value) disallow.push(value);
  }

  const blocked = disallow.find((pattern) => {
    const anchored = pattern.endsWith('$');
    const body = anchored ? pattern.slice(0, -1) : pattern;
    const source =
      '^' +
      body.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') +
      (anchored ? '$' : '');
    return new RegExp(source).test(pathname);
  });

  if (blocked) {
    console.error(`robots.txt disallows ${pathname} (rule: ${blocked}). Not fetching.`);
    process.exit(1);
  }
}

const LOT_SCHEMA = {
  type: 'object',
  properties: {
    auctionTitle: { type: 'string' },
    closesAt: { type: 'string' },
    locationText: { type: 'string' },
    buyersPremiumText: { type: 'string' },
    lots: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lotNumber: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          currentBid: { type: 'number' },
          closesAt: { type: 'string' },
          locationText: { type: 'string' },
          lotUrl: { type: 'string' },
          imageUrls: { type: 'array', items: { type: 'string' } },
        },
        required: ['lotNumber', 'title'],
      },
    },
  },
  required: ['lots'],
};

await assertAllowed(url);

const body = {
  url,
  formats: [
    'markdown',
    {
      type: 'json',
      prompt:
        'This is an auction catalogue page. Extract every lot listed on it, plus the auction title, closing time, location and any statement of the buyer premium.',
      schema: LOT_SCHEMA,
    },
  ],
  onlyMainContent: true,
};

console.log(`Fetching ${url} ...`);
const response = await fetch('https://api.firecrawl.dev/v2/scrape', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey()}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const result = await response.json();
if (!response.ok) {
  console.error(`Firecrawl returned ${response.status}:`, JSON.stringify(result).slice(0, 600));
  process.exit(1);
}

mkdirSync('probe-output', { recursive: true });
const data = result.data ?? result;
writeFileSync('probe-output/page.json', JSON.stringify(data, null, 2));

const lots = data.json?.lots ?? [];
console.log(`\nLots found: ${lots.length}`);
console.log(`Auction title: ${data.json?.auctionTitle ?? 'not found'}`);
console.log(`Buyer premium text: ${data.json?.buyersPremiumText ?? 'not found'}`);
console.log('\nFirst two lots:');
console.log(JSON.stringify(lots.slice(0, 2), null, 2));
console.log('\nFull output written to probe-output/page.json');
console.log('Markdown length:', (data.markdown ?? '').length, 'characters');
