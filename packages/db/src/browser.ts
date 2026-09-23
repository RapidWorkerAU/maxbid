'use client';

// The Supabase client for client components.
//
// It carries the publishable key only, so every query it makes is still
// subject to row level security.

import { createBrowserClient } from '@supabase/ssr';
import { supabasePublishableKey, supabaseUrl } from './env';
import type { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabasePublishableKey());
}
