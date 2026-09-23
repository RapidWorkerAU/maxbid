// robots.txt parsing.
//
// Rule 1 of docs/02-specs/site-access.md: read and obey robots.txt on every
// run, not once at build time. A site can change it any day, and D45 commits
// us to respecting it.
//
// This is a deliberately plain reader. It handles the User-agent, Disallow and
// Allow directives with the usual longest match wins rule, and nothing else.

export type RobotsRules = {
  allow: string[];
  disallow: string[];
};

/** Reads the rules that apply to us, falling back to the wildcard group. */
export function parseRobots(text: string, userAgent = '*'): RobotsRules {
  const wanted = userAgent.toLowerCase();
  const groups = new Map<string, RobotsRules>();
  let current: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split('#')[0]?.trim() ?? '';
    if (!line) continue;

    const [rawField, ...rest] = line.split(':');
    const field = rawField?.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (!field) continue;

    if (field === 'user-agent') {
      const agent = value.toLowerCase();
      if (!groups.has(agent)) groups.set(agent, { allow: [], disallow: [] });
      current = [agent];
      continue;
    }

    for (const agent of current) {
      const group = groups.get(agent);
      if (!group) continue;
      // An empty Disallow means everything is allowed, so it is not a rule.
      if (field === 'disallow' && value) group.disallow.push(value);
      if (field === 'allow' && value) group.allow.push(value);
    }
  }

  return groups.get(wanted) ?? groups.get('*') ?? { allow: [], disallow: [] };
}

/** Does a robots pattern, which may end in $ and contain *, match this path? */
function matches(pattern: string, path: string): boolean {
  const anchoredEnd = pattern.endsWith('$');
  const body = anchoredEnd ? pattern.slice(0, -1) : pattern;
  const source =
    '^' +
    body
      .split('*')
      .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*') +
    (anchoredEnd ? '$' : '');
  return new RegExp(source).test(path);
}

/**
 * May we fetch this path?
 *
 * The longest matching rule wins, and Allow beats Disallow at equal length,
 * which is how every major crawler resolves a conflict.
 */
export function isAllowed(rules: RobotsRules, path: string): boolean {
  const longest = (patterns: string[]) =>
    patterns.filter((p) => matches(p, path)).reduce((best, p) => Math.max(best, p.length), -1);

  const allow = longest(rules.allow);
  const disallow = longest(rules.disallow);

  if (disallow === -1) return true;
  return allow >= disallow;
}
