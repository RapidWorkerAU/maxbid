import { createServerSupabase } from '@maxbid/db/server';
import { cookies } from 'next/headers';

/**
 * The Supabase client for server components and server actions.
 *
 * Next only allows cookies to be written from a server action or a route
 * handler, so the setter is wrapped. In a server component the refreshed
 * cookie is dropped and the middleware handles it on the next request.
 */
export async function supabaseServer() {
  const store = await cookies();
  return createServerSupabase({
    getAll: () => store.getAll(),
    set: (name, value, options) => {
      try {
        store.set(name, value, options);
      } catch {
        // Called from a server component. The middleware refreshes instead.
      }
    },
  });
}
