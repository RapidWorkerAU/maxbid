// Environment variables the database clients need.
//
// These fail at boot with a plain message naming what is missing, rather than
// throwing a null reference somewhere further in. Keys live only in .env.local
// files and in Vercel, per rule 12.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to apps/app/.env.local and fill it in.`,
    );
  }
  return value;
}

/** The project URL. Safe to send to the browser. */
export function supabaseUrl(): string {
  return required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/** The publishable key. Safe to send to the browser. Row level security applies. */
export function supabasePublishableKey(): string {
  return required(
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/**
 * The secret key. Bypasses row level security, so it is server only.
 * Never import this from a client component.
 */
export function supabaseSecretKey(): string {
  return required('SUPABASE_SECRET_KEY', process.env.SUPABASE_SECRET_KEY);
}
