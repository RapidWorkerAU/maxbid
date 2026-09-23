'use client';

import { Button } from '@maxbid/ui/primitives/Button';
import { Input } from '@maxbid/ui/primitives/Input';
import { InfoNote } from '@maxbid/ui/primitives/InfoNote';
import { useActionState } from 'react';
import { sendMagicLink, type ActionResult } from '../../lib/actions';

export function SignInForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    sendMagicLink,
    null,
  );

  if (state && 'ok' in state) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="font-sans text-lg font-bold">Check your email</h2>
        <p className="text-ink-muted">
          If that address has an account, we have sent a link that signs you in.
          The link works once and expires in an hour.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        id="email"
        name="email"
        type="email"
        label="Email address"
        hint="We send you a link that signs you in. There is no password to remember."
        autoComplete="email"
        required
        error={state && 'error' in state ? state.error : undefined}
      />
      <Button type="submit" loading={pending}>
        {pending ? 'Sending the link' : 'Email me a sign in link'}
      </Button>
      <InfoNote>
        We will only use your email address to sign you in and to send you the
        results you ask for.
      </InfoNote>
    </form>
  );
}
