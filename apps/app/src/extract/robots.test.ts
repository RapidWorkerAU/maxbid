import { describe, expect, it } from 'vitest';
import { isAllowed, parseRobots } from './robots';

// The real Pickles rules, abridged. Decision record 0012 removed Pickles from
// V1, and these are the rules that decided it.
const PICKLES = `
User-Agent: *
Disallow: /cars/vehicle/*/itemid-*/lotid-*
Disallow: /general/item/*/itemid-*/lotid-*
Disallow: /*/auctions?*
Disallow: /catalogue/
Allow: /sign-in$
Disallow: /sign-in?*
`;

// The real Grays rules, abridged.
const GRAYS = `
Sitemap: https://www.grays.com/sitemap.xml
User-agent: *
Disallow: /*.axd$
Disallow: /Services/*
Disallow: /login.aspx
`;

// The real Lloyds rules. An empty Disallow allows everything.
const LLOYDS = `
User-agent: *
Disallow:
`;

describe('parsing', () => {
  it('reads the wildcard group when there is no rule for us', () => {
    const rules = parseRobots(GRAYS, 'maxbidbot');
    expect(rules.disallow).toContain('/Services/*');
  });

  it('prefers a group named for us over the wildcard', () => {
    const rules = parseRobots(
      'User-agent: *\nDisallow: /\n\nUser-agent: maxbidbot\nDisallow: /private',
      'maxbidbot',
    );
    expect(rules.disallow).toEqual(['/private']);
  });

  it('ignores comments and blank lines', () => {
    const rules = parseRobots('# a note\nUser-agent: *\nDisallow: /admin # inline\n\n');
    expect(rules.disallow).toEqual(['/admin']);
  });

  it('treats an empty Disallow as no rule at all', () => {
    expect(parseRobots(LLOYDS).disallow).toEqual([]);
  });
});

describe('Lloyds allows everything', () => {
  const rules = parseRobots(LLOYDS, 'maxbidbot');

  it('permits a lot page', () => {
    expect(isAllowed(rules, '/auction/4821/lot/12')).toBe(true);
  });
});

describe('Grays allows what we need', () => {
  const rules = parseRobots(GRAYS, 'maxbidbot');

  it('permits a sale page and a lot page', () => {
    expect(isAllowed(rules, '/sale/12345/woodworking-machinery')).toBe(true);
    expect(isAllowed(rules, '/lot/98765')).toBe(true);
  });

  it('refuses the paths it disallows', () => {
    expect(isAllowed(rules, '/Services/anything')).toBe(false);
    expect(isAllowed(rules, '/login.aspx')).toBe(false);
  });

  it('honours an anchored pattern, so only the suffix matches', () => {
    expect(isAllowed(rules, '/something.axd')).toBe(false);
    expect(isAllowed(rules, '/something.axd/more')).toBe(true);
  });
});

describe('Pickles refuses what we would need', () => {
  const rules = parseRobots(PICKLES, 'maxbidbot');

  it('refuses a lot detail page', () => {
    expect(isAllowed(rules, '/general/item/edgebander/itemid-1/lotid-2')).toBe(false);
    expect(isAllowed(rules, '/cars/vehicle/hilux/itemid-1/lotid-2')).toBe(false);
  });

  it('refuses the catalogue', () => {
    expect(isAllowed(rules, '/catalogue/')).toBe(false);
  });

  it('lets the longest matching rule win, and Allow win a tie', () => {
    // Allow /sign-in$ against Disallow /sign-in?*
    expect(isAllowed(rules, '/sign-in')).toBe(true);
  });
});

describe('when there are no rules', () => {
  it('allows everything, because no robots.txt means no restriction', () => {
    expect(isAllowed({ allow: [], disallow: [] }, '/anything')).toBe(true);
  });
});
