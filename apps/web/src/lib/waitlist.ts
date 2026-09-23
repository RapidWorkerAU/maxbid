'use server';

import { createServiceSupabase } from '@maxbid/db/server';
import type { EmailCaptureState } from '@maxbid/ui/composites/EmailCapture';

// F78. Sign ups are stored with their source.
//
// The table has row level security on with no policy, so nothing reachable
// from the browser can read or write it. This action uses the secret key,
// which is server only.

export async function joinWaitlist(
  _previous: EmailCaptureState,
  form: FormData,
): Promise<EmailCaptureState> {
  const email = String(form.get('email') ?? '').trim();
  const source = String(form.get('source') ?? 'holding-page');

  if (!email.includes('@') || email.length < 5) {
    return { status: 'error', message: 'Enter an email address so we can tell you when we open.' };
  }

  const utm = ['utm_source', 'utm_medium', 'utm_campaign'].reduce<Record<string, string>>(
    (carry, key) => {
      const value = form.get(key);
      if (value) carry[key] = String(value);
      return carry;
    },
    {},
  );

  try {
    const supabase = createServiceSupabase();
    const { error } = await supabase
      .from('waitlist_signups')
      .insert({ email, source, utm: Object.keys(utm).length ? utm : null });

    // Already on the list. Telling them so would confirm the address is
    // registered, and it changes nothing for them either way.
    if (error && error.code !== '23505') {
      return { status: 'error', message: 'We could not add you just now. Please try again.' };
    }
  } catch {
    return { status: 'error', message: 'We could not add you just now. Please try again.' };
  }

  return { status: 'success' };
}
