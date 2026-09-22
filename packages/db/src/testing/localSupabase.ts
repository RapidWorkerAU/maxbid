// Helpers for the row level security tests.
//
// These run against local Supabase, not the hosted project. The connection
// details come from the environment, which scripts/run-rls-tests.mjs fills in
// from `supabase status`.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Role = 'owner' | 'admin' | 'buyer' | 'viewer';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Start local Supabase with pnpm db:start, then run pnpm test:rls.`,
    );
  }
  return value;
}

export const SUPABASE_URL = () => required('SUPABASE_URL');

/** Full access, bypassing row level security. Used only to set tests up. */
export function serviceClient(): SupabaseClient {
  return createClient(SUPABASE_URL(), required('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** A signed out client, which is what an anonymous visitor gets. */
export function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL(), required('SUPABASE_ANON_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type TestUser = {
  id: string;
  email: string;
  client: SupabaseClient;
};

/** Creates a confirmed user and returns a client signed in as them. */
export async function createUser(prefix: string): Promise<TestUser> {
  const admin = serviceClient();
  const email = `${prefix}-${crypto.randomUUID()}@maxbid.test`;
  const password = 'test-password-1234';

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error('Could not create the test user.');

  const client = anonClient();
  const signIn = await client.auth.signInWithPassword({ email, password });
  if (signIn.error) throw signIn.error;

  return { id: data.user.id, email, client };
}

/** Creates an organisation owned by nobody, for the service role to populate. */
export async function createOrganisation(name: string): Promise<string> {
  const admin = serviceClient();
  const { data, error } = await admin
    .from('organisations')
    .insert({ name })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function addMember(orgId: string, userId: string, role: Role): Promise<void> {
  const admin = serviceClient();
  const { error } = await admin
    .from('organisation_members')
    .insert({ org_id: orgId, user_id: userId, role });
  if (error) throw error;
}

/** True when a select returned no rows, which is how row level security hides data. */
export function isEmpty(result: { data: unknown[] | null }): boolean {
  return (result.data ?? []).length === 0;
}
