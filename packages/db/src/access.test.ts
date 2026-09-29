import { describe, expect, it } from 'vitest';
import {
  ONBOARDING_PATH,
  SETUP_PATH,
  SIGN_IN_PATH,
  TERMS_PATH,
  isPublicPath,
  landingFor,
  redirectFor,
  type Visitor,
} from './access';

const signedOut: Visitor = { signedIn: false, hasOrganisation: false, termsAccepted: false };
const needsTerms: Visitor = { signedIn: true, hasOrganisation: false, termsAccepted: false };
const needsOrg: Visitor = { signedIn: true, hasOrganisation: false, termsAccepted: true };
const settled: Visitor = { signedIn: true, hasOrganisation: true, termsAccepted: true };

describe('a signed out visitor', () => {
  it('is sent to sign in from anywhere in the app', () => {
    expect(redirectFor(signedOut, '/')).toBe(SIGN_IN_PATH);
    expect(redirectFor(signedOut, '/watchlist')).toBe(SIGN_IN_PATH);
  });

  it('may reach the sign in page and the auth callback', () => {
    expect(redirectFor(signedOut, SIGN_IN_PATH)).toBeNull();
    expect(redirectFor(signedOut, '/auth/callback')).toBeNull();
  });

  it('lets Inngest reach its own endpoint, which uses a signing key not a session', () => {
    expect(isPublicPath('/api/inngest')).toBe(true);
    expect(redirectFor(signedOut, '/api/inngest')).toBeNull();
    expect(redirectFor(settled, '/api/inngest')).toBeNull();
  });

  it('may reach the manifest and icons, so the app can still install', () => {
    expect(isPublicPath('/manifest.webmanifest')).toBe(true);
    expect(isPublicPath('/icons/icon-192.png')).toBe(true);
  });
});

describe('the terms gate', () => {
  it('holds a signed in user on the terms page until they accept', () => {
    expect(redirectFor(needsTerms, '/')).toBe(TERMS_PATH);
    expect(redirectFor(needsTerms, '/watchlist')).toBe(TERMS_PATH);
    expect(redirectFor(needsTerms, TERMS_PATH)).toBeNull();
  });

  it('comes before choosing an organisation', () => {
    expect(redirectFor(needsTerms, ONBOARDING_PATH)).toBe(TERMS_PATH);
  });

  it('sends someone who still needs an organisation to onboarding', () => {
    expect(redirectFor(needsOrg, TERMS_PATH)).toBe(ONBOARDING_PATH);
  });

  it('lets them past once accepted', () => {
    expect(redirectFor(settled, '/')).toBeNull();
    expect(redirectFor(settled, TERMS_PATH)).toBe('/');
  });
});

describe('the organisation gate', () => {
  it('sends a user with no organisation to onboarding', () => {
    expect(redirectFor(needsOrg, '/')).toBe(ONBOARDING_PATH);
    expect(redirectFor(needsOrg, ONBOARDING_PATH)).toBeNull();
  });

  it('sends a settled user away from onboarding', () => {
    expect(redirectFor(settled, ONBOARDING_PATH)).toBe('/');
  });
});

describe('the sign in page', () => {
  it('sends a settled user straight home, not through onboarding', () => {
    expect(redirectFor(settled, SIGN_IN_PATH)).toBe('/');
  });

  it('sends a user with no organisation to onboarding', () => {
    expect(redirectFor(needsOrg, SIGN_IN_PATH)).toBe(ONBOARDING_PATH);
  });

  it('sends someone who has not accepted the terms to the terms first', () => {
    expect(redirectFor(needsTerms, SIGN_IN_PATH)).toBe(TERMS_PATH);
  });
});

describe('no gate ever loops', () => {
  const paths = ['/', '/watchlist', SIGN_IN_PATH, TERMS_PATH, ONBOARDING_PATH, '/auth/callback'];
  const visitors: [string, Visitor][] = [
    ['signed out', signedOut],
    ['needs terms', needsTerms],
    ['needs an organisation', needsOrg],
    ['settled', settled],
  ];

  it.each(visitors)('settles within one redirect for a visitor who %s', (_name, visitor) => {
    for (const path of paths) {
      const first = redirectFor(visitor, path);
      if (first === null) continue;
      // Following the redirect once must land somewhere that does not redirect.
      expect(redirectFor(visitor, first)).toBeNull();
    }
  });
});

describe('the setup gate', () => {
  const settled = { signedIn: true, hasOrganisation: true, termsAccepted: true };

  it('sends a user who has not set up to setup', () => {
    // Decision record 0022. A new organisation's cost profile is empty, and
    // nothing can be calculated until the user fills it in.
    expect(redirectFor({ ...settled, isSetUp: false }, '/')).toBe(SETUP_PATH);
    expect(landingFor({ ...settled, isSetUp: false })).toBe(SETUP_PATH);
  });

  it('lets them stay on setup once they are there', () => {
    expect(redirectFor({ ...settled, isSetUp: false }, SETUP_PATH)).toBeNull();
  });

  it('sends a user who has set up away from setup', () => {
    expect(redirectFor({ ...settled, isSetUp: true }, SETUP_PATH)).toBe('/');
  });

  it('leaves a user alone when nobody asked', () => {
    // Undefined means the caller did not look, which is not the same as not
    // set up. Treating it as not set up would trap everybody in a loop the
    // first time a caller forgot to ask.
    expect(redirectFor(settled, '/')).toBeNull();
    expect(landingFor(settled)).toBe('/');
  });

  it('comes after the terms, which are more serious', () => {
    const noTerms = { ...settled, termsAccepted: false, isSetUp: false };
    expect(redirectFor(noTerms, '/')).toBe(TERMS_PATH);
  });

  it('comes after having an organisation, because there is nothing to set up without one', () => {
    const noOrg = { ...settled, hasOrganisation: false, isSetUp: false };
    expect(redirectFor(noOrg, '/')).toBe(ONBOARDING_PATH);
  });

  it('never blocks the background jobs', () => {
    // Inngest authenticates with its signing key, not a session cookie.
    expect(redirectFor({ ...settled, isSetUp: false }, '/api/inngest')).toBeNull();
  });
});
