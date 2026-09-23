import { landingFor } from '@maxbid/db';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer } from '../../../lib/supabase';

// Where the magic link lands. Exchanges the code for a session, then sends the
// user wherever they belong, which the middleware would do anyway.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const url = request.nextUrl.clone();
  url.search = '';

  if (!code) {
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  const { data } = await supabase.auth.getUser();
  const [memberships, material] = await Promise.all([
    supabase.from('organisation_members').select('org_id').limit(1),
    supabase.from('terms_versions').select('version, terms_acceptances(user_id)').eq('is_material', true),
  ]);

  url.pathname = landingFor({
    signedIn: Boolean(data.user),
    hasOrganisation: (memberships.data ?? []).length > 0,
    termsAccepted: (material.data ?? []).every((row) => (row.terms_acceptances ?? []).length > 0),
  });
  return NextResponse.redirect(url);
}
