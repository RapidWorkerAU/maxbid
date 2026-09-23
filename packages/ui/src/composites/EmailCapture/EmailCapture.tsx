'use client';

import type { ReactNode } from 'react';
import { Button } from '../../primitives/Button/Button';
import { InfoNote } from '../../primitives/InfoNote/InfoNote';
import { Input } from '../../primitives/Input/Input';

/**
 * UI35. Email capture for the waitlist and the Auction Breakdown sign up.
 *
 * It renders on a light surface. Input labels are ink, which does not read on
 * a navy panel, so a navy version needs an Input variant first. That would set
 * Input back to In review, so it waits for UI43 SignupPanel.
 *
 * The component holds no submission logic. The caller passes the form action
 * and the current state, so the same component serves the waitlist, the
 * newsletter and anything later.
 */
export type EmailCaptureState = {
  status: 'idle' | 'error' | 'success';
  /** Shown under the field when the status is error. */
  message?: string;
};

export type EmailCaptureProps = {
  id: string;
  label: string;
  hint?: string;
  submitLabel: string;
  pendingLabel: string;
  /** Shown in place of the form once the address is stored. */
  successHeading: string;
  successBody: ReactNode;
  /** A note beneath the form, such as what the address will be used for. */
  note?: ReactNode;
  action: (formData: FormData) => void;
  state: EmailCaptureState;
  pending?: boolean;
};

export function EmailCapture({
  id,
  label,
  hint,
  submitLabel,
  pendingLabel,
  successHeading,
  successBody,
  note,
  action,
  state,
  pending = false,
}: EmailCaptureProps) {
  if (state.status === 'success') {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="font-sans text-lg font-bold text-ink">{successHeading}</h2>
        <p className="font-sans text-ink-muted">{successBody}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        id={id}
        name="email"
        type="email"
        label={label}
        hint={hint}
        autoComplete="email"
        required
        error={state.status === 'error' ? state.message : undefined}
      />
      <div>
        <Button type="submit" loading={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
      {note ? <InfoNote>{note}</InfoNote> : null}
    </form>
  );
}
