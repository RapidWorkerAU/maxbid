'use server';

import { DS01 } from '@maxbid/content';
import { redirect } from 'next/navigation';
import { supabaseServer } from './supabase';

export type ActionResult = { error: string } | { ok: true };

/**
 * Sends a magic link. F01.
 *
 * The message never says whether the address has an account, because that
 * would let anyone test which emails are registered.
 */
export async function sendMagicLink(_previous: ActionResult | null, form: FormData) {
  const email = String(form.get('email') ?? '').trim();
  if (!email.includes('@')) {
    return { error: 'Enter an email address so we can send your sign in link.' };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/callback` },
  });

  if (error) {
    return { error: 'We could not send the link just now. Please try again in a moment.' };
  }
  return { ok: true as const };
}

/** Records acceptance of a terms version. F66. The wording is DS01. */
export async function acceptTerms(_previous: ActionResult | null, form: FormData) {
  const version = String(form.get('version') ?? '');
  if (!version) return { error: 'We could not tell which terms you accepted. Please reload.' };

  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: 'Your session has expired. Please sign in again.' };

  const { error } = await supabase
    .from('terms_acceptances')
    .insert({ user_id: data.user.id, version });

  // Accepting twice is not a failure. The record already exists.
  if (error && error.code !== '23505') {
    return { error: 'We could not record your acceptance. Please try again.' };
  }
  redirect('/welcome');
}

/** The text a user is accepting. Imported, never typed. */
export const TERMS_TEXT = DS01;

/**
 * Creates an organisation and makes the caller its owner. F02.
 *
 * This calls the database function rather than inserting directly, because a
 * new user cannot insert their own first membership under row level security.
 */
export async function createOrganisation(_previous: ActionResult | null, form: FormData) {
  const name = String(form.get('name') ?? '').trim();
  if (name.length < 2) {
    return { error: 'Enter a name for your organisation, such as your business name.' };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.rpc('create_organisation', { org_name: name });

  if (error) {
    return { error: 'We could not create your organisation. Please try again.' };
  }
  redirect('/');
}
