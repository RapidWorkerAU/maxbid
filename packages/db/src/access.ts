// Who may go where, as plain functions.
//
// The middleware calls these. Keeping the decisions out of the middleware
// means every rule can be tested without a browser or a database.
//
// F66 and security-and-rls.md: middleware blocks app access when a material
// terms version is unaccepted.

export const SIGN_IN_PATH = '/sign-in';
export const ONBOARDING_PATH = '/welcome';
export const TERMS_PATH = '/terms';

/**
 * Paths a signed out visitor may reach.
 *
 * /api/inngest is here because Inngest authenticates with its signing key,
 * not a session cookie. Redirecting it to sign in would silently break every
 * background job.
 */
const PUBLIC_PREFIXES = [
  SIGN_IN_PATH,
  '/auth',
  '/api/inngest',
  '/manifest.webmanifest',
  '/icons',
  '/favicon',
];

export type Visitor = {
  signedIn: boolean;
  /** True once the user belongs to at least one organisation. */
  hasOrganisation: boolean;
  /** True when every material terms version has been accepted. */
  termsAccepted: boolean;
};

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Where this request should go, or null to let it through.
 *
 * The order matters. Signing in comes first, then accepting the terms,
 * because F66 says the user cannot continue until they accept. Choosing an
 * organisation comes last, since it is the least serious gate.
 */
/**
 * Where a signed in user belongs right now.
 *
 * Used to send someone straight to their destination rather than bouncing
 * them through an intermediate gate.
 */
export function landingFor(visitor: Visitor): string {
  if (!visitor.termsAccepted) return TERMS_PATH;
  if (!visitor.hasOrganisation) return ONBOARDING_PATH;
  return '/';
}

export function redirectFor(visitor: Visitor, pathname: string): string | null {
  if (!visitor.signedIn) {
    return isPublicPath(pathname) ? null : SIGN_IN_PATH;
  }

  // A signed in user has no reason to see the sign in page.
  if (pathname === SIGN_IN_PATH) {
    return landingFor(visitor);
  }

  if (isPublicPath(pathname)) return null;

  if (!visitor.termsAccepted) {
    return pathname === TERMS_PATH ? null : TERMS_PATH;
  }

  // Accepted the terms, so the terms page is behind them.
  if (pathname === TERMS_PATH) return landingFor(visitor);

  if (!visitor.hasOrganisation) {
    return pathname === ONBOARDING_PATH ? null : ONBOARDING_PATH;
  }

  if (pathname === ONBOARDING_PATH) return '/';

  return null;
}
