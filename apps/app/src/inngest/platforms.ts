// Which auction house a pasted URL belongs to.
//
// F05 says an unsupported URL shows a clear message and offers PDF upload, so
// this never guesses. Source: docs/02-specs/site-access.md.

export type PlatformSlug = 'grays' | 'lloyds' | 'pdf';

export type PlatformMatch =
  | { supported: true; slug: PlatformSlug }
  | { supported: false; reason: string };

/**
 * Hosts we may extract from. Pickles is deliberately absent: decision record
 * 0012 removed it from V1 because its terms prohibit automated access.
 */
const HOSTS: Record<string, PlatformSlug> = {
  'grays.com': 'grays',
  'www.grays.com': 'grays',
  'lloydsauctions.com.au': 'lloyds',
  'www.lloydsauctions.com.au': 'lloyds',
};

/** Hosts we recognise but may not touch, so the message can say why. */
const PROHIBITED: Record<string, string> = {
  'pickles.com.au': 'Pickles',
  'www.pickles.com.au': 'Pickles',
};

export function detectPlatform(input: string): PlatformMatch {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return {
      supported: false,
      reason: 'That does not look like a link. Paste the web address of an auction catalogue.',
    };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { supported: false, reason: 'Paste a link that starts with https.' };
  }

  const host = url.hostname.toLowerCase();

  const prohibited = PROHIBITED[host];
  if (prohibited) {
    return {
      supported: false,
      reason: `We cannot analyse ${prohibited} catalogues. Their terms of use do not allow it. You can upload the catalogue as a PDF instead.`,
    };
  }

  const slug = HOSTS[host];
  if (slug) return { supported: true, slug };

  return {
    supported: false,
    reason:
      'We do not support that auction house yet. You can upload the catalogue as a PDF instead.',
  };
}
