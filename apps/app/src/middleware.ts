import { redirectFor, type Visitor } from '@maxbid/db';
import { createServerSupabase } from '@maxbid/db/server';
import { NextResponse, type NextRequest } from 'next/server';

// Refreshes the session and applies the gates on every request.
//
// The decisions themselves live in packages/db/src/access.ts, so they are
// tested without a browser. This file only gathers the facts and acts.

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerSupabase({
    getAll: () => request.cookies.getAll(),
    set: (name, value, options) => {
      response.cookies.set(name, value, options);
    },
  });

  // getUser revalidates the token with Supabase. getSession trusts the cookie,
  // which is not safe to gate on.
  const { data } = await supabase.auth.getUser();
  const visitor = await describeVisitor(supabase, data.user?.id);

  const destination = redirectFor(visitor, request.nextUrl.pathname);
  if (!destination) return response;

  const url = request.nextUrl.clone();
  url.pathname = destination;
  url.search = '';
  const redirect = NextResponse.redirect(url);
  // Carry the refreshed session across, or the next request signs out again.
  for (const cookie of response.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

async function describeVisitor(
  supabase: ReturnType<typeof createServerSupabase>,
  userId: string | undefined,
): Promise<Visitor> {
  if (!userId) {
    return { signedIn: false, hasOrganisation: false, termsAccepted: false };
  }

  const [memberships, outstanding] = await Promise.all([
    supabase.from('organisation_members').select('org_id').limit(1),
    // Every material version the user has not accepted. F66.
    supabase
      .from('terms_versions')
      .select('version, terms_acceptances(user_id)')
      .eq('is_material', true),
  ]);

  const unaccepted = (outstanding.data ?? []).filter(
    (row) => (row.terms_acceptances ?? []).length === 0,
  );

  return {
    signedIn: true,
    hasOrganisation: (memberships.data ?? []).length > 0,
    termsAccepted: unaccepted.length === 0,
  };
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|.*\\.png$).*)'],
};
