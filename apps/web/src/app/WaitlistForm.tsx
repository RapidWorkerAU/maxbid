'use client';

import { EmailCapture, type EmailCaptureState } from '@maxbid/ui/composites/EmailCapture';
import { useActionState } from 'react';
import { joinWaitlist } from '../lib/waitlist';

const IDLE: EmailCaptureState = { status: 'idle' };

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, IDLE);

  return (
    <div id="waitlist" className="rounded-sm bg-surface p-6">
      <EmailCapture
        id="waitlist-email"
        label="Email address"
        hint="We will tell you when MaxBid opens, and nothing else."
        submitLabel="Join the waitlist"
        pendingLabel="Adding you to the waitlist"
        successHeading="You are on the list"
        successBody="We will email you when MaxBid opens. Founding member pricing is held for everyone who joins before launch."
        note="We will only use your address to tell you when MaxBid opens. You can unsubscribe at any time."
        action={action}
        state={state}
        pending={pending}
      />
    </div>
  );
}
