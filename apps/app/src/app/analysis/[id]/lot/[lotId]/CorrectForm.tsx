'use client';

import { Button } from '@maxbid/ui/primitives/Button';
import { InfoNote } from '@maxbid/ui/primitives/InfoNote';
import { Input } from '@maxbid/ui/primitives/Input';
import { useState, useTransition } from 'react';
import { correctIdentification } from '../../../../../lib/correctIdentification';

/**
 * Correcting what we decided a lot is. F19, D11.
 *
 * Everything about a lot is built on what we think it is: the search terms,
 * which comparables count as the same thing, and the weight each one carries.
 * So this is the one place a user can disagree with us and have it change the
 * answer rather than just be noted.
 *
 * It opens closed. Most lots do not need correcting, and a form sitting open
 * on every lot invites editing something that was right.
 *
 * The correction belongs to the organisation that made it. Everybody else
 * keeps reading what we worked out, because one organisation's opinion about
 * a lot is not a fact about the lot.
 */
export type CorrectFormProps = {
  analysisId: string;
  lotId: string;
  /** What we currently think, which the boxes start on. */
  current: {
    brand: string | null;
    model: string | null;
    year: number | null;
    conditionNotes: string | null;
  };
  /** True once this organisation has already corrected this lot. */
  alreadyCorrected?: boolean;
};

/** The boxes themselves, apart so the form stays inside the line limit. */
function Fields({ current }: { current: CorrectFormProps['current'] }) {
  return (
    <>
      <Input id="brand" name="brand" label="Make" defaultValue={current.brand ?? ''} />
      <Input id="model" name="model" label="Model" defaultValue={current.model ?? ''} />
      <Input
        id="year"
        name="year"
        label="Year"
        inputMode="numeric"
        mono
        hint="Four digits, or leave it blank if you are not sure."
        defaultValue={current.year ?? ''}
      />
      <Input
        id="conditionNotes"
        name="conditionNotes"
        label="Anything about its condition"
        hint="Optional. Damage, hours, service history or anything else that changes what it is worth."
        defaultValue={current.conditionNotes ?? ''}
      />
    </>
  );
}

export function CorrectForm({
  analysisId,
  lotId,
  current,
  alreadyCorrected = false,
}: CorrectFormProps) {
  const [open, setOpen] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [working, startWorking] = useTransition();

  if (!open) {
    return (
      <div className="mt-4">
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {alreadyCorrected ? 'Change what you told us this is' : 'This is not right'}
        </Button>
        {said && !failed ? (
          <p className="mt-2 font-sans text-sm text-ink-muted" aria-live="polite">
            {said}
          </p>
        ) : null}
      </div>
    );
  }

  const save = (form: FormData) =>
    startWorking(async () => {
      const result = await correctIdentification(analysisId, lotId, form);
      if ('error' in result) {
        setFailed(true);
        setSaid(result.error);
        return;
      }
      setFailed(false);
      setSaid(
        'Saved. We are working the figures out again from what you told us, which takes a minute or two.',
      );
      setOpen(false);
    });

  return (
    <form action={save} className="mt-4 border border-border bg-page p-4">
      <p className="font-sans text-sm text-ink-muted">
        Tell us what this lot actually is. We work out what it is worth by searching for the same
        thing, so a make and model we have wrong makes every figure below wrong with it. What you
        put here is yours: nobody else analysing this sale sees it.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Fields current={current} />
      </div>

      {said && failed ? (
        <InfoNote tone="warning" className="mt-4">
          {said}
        </InfoNote>
      ) : null}

      <div className="mt-4 flex gap-3">
        <Button type="submit" loading={working}>
          {working ? 'Saving' : 'Save and work it out again'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={working}>
          Leave it as it is
        </Button>
      </div>
    </form>
  );
}
