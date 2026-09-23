// Supabase clients for server components, server actions and middleware.
//
// Every one is typed against database.types.ts, so a query that names a column
// the schema does not have fails the type check rather than at run time.

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabasePublishableKey, supabaseSecretKey, supabaseUrl } from './env';
import type { Database } from './database.types';

/** The cookie shape both Next and the middleware speak. */
export type CookieStore = {
  getAll: () => { name: string; value: string }[];
  set: (name: string, value: string, options?: Record<string, unknown>) => void;
};

/**
 * A client that acts as the signed in user, reading and writing the session
 * cookies. Row level security applies to everything it does.
 */
export function createServerSupabase(cookies: CookieStore) {
  return createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value, options } of toSet) {
          cookies.set(name, value, options);
        }
      },
    },
  });
}

/**
 * A client that bypasses row level security. For background jobs and admin
 * work only. Never reachable from the browser, because the secret key is not
 * a NEXT_PUBLIC variable.
 */
export function createServiceSupabase() {
  return createSupabaseClient<Database>(supabaseUrl(), supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
