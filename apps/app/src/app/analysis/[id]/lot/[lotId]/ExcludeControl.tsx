'use client';

import { Button } from '@maxbid/ui/primitives/Button';
import { InfoNote } from '@maxbid/ui/primitives/InfoNote';
import { Input } from '@maxbid/ui/primitives/Input';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { excludeComparable, includeComparable } from '../../../../../lib/excludeComparable';

/**
 * Setting one comparable aside, or putting it back. F62.
 *
 * The evidence panel exists so a reader can judge what a range was built
 * from. This is what lets them act on that judgement. Until now they could
 * see a listing that was plainly not the same thing and do nothing about it.
 *
 * A reason is required. An exclusion with no reason is a figure that moved
 * for reasons nobody can reconstruct, and a month later neither they nor we
 * could say why the range is what it is.
 *
 * It opens closed, like the correction form, because most comparables are
 * fine and a box on every row invites excluding the evidence that disagrees
 * with a hope.
 */
export type ExcludeControlProps = {
  analysisId: string;
  lotId: string;
  /** The lot_comparables row, which is the judgement an exclusion names. */
  comparableId: string;
  /** True where this analysis has already set this one aside. */
  setAside: boolean;
};

export function ExcludeControl({ analysisId, lotId, comparableId, setAside }: ExcludeControlProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [working, startWorking] = useTransition();

  const finish = (message: string) => {
    setFailed(false);
    setSaid(message);
    setOpen(false);
    // The exclusion is saved the moment the action returns, so the row can
    // say so now. The figures above it are worked out again in the
    // background, which is what the message explains.
    router.refresh();
  };

  const putBack = () =>
    startWorking(async () => {
      const result = await includeComparable(analysisId, lotId, comparableId);
      if ('error' in result) {
        setFailed(true);
        setSaid(result.error);
        return;
      }
      finish('Back in. We are working the figures out again with it, which takes a moment.');
    });

  const setItAside = (form: FormData) =>
    startWorking(async () => {
      const reason = String(form.get('reason') ?? '');
      const result = await excludeComparable(analysisId, lotId, comparableId, reason);
      if ('error' in result) {
        setFailed(true);
        setSaid(result.error);
        return;
      }
      finish('Set aside. We are working the figures out again without it, which takes a moment.');
    });

  if (setAside) {
    return (
      <div>
        <Button variant="secondary" onClick={putBack} loading={working}>
          {working ? 'Putting it back' : 'Put this one back'}
        </Button>
        <Spoken said={said} failed={failed} />
      </div>
    );
  }

  if (!open) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          This sale does not belong
        </Button>
        <Spoken said={said} failed={failed} />
      </div>
    );
  }

  return (
    <Reason
      comparableId={comparableId}
      said={said}
      failed={failed}
      working={working}
      onSubmit={setItAside}
      onClose={() => setOpen(false)}
    />
  );
}

/** The box they say why in, apart so neither function runs long. */
function Reason({
  comparableId,
  said,
  failed,
  working,
  onSubmit,
  onClose,
}: {
  comparableId: string;
  said: string | null;
  failed: boolean;
  working: boolean;
  onSubmit: (form: FormData) => void;
  onClose: () => void;
}) {
  return (
    <form action={onSubmit} className="border border-border bg-page p-4">
      <p className="font-sans text-sm text-ink-muted">
        Tell us why this sale is not comparable to this lot. We will work the figures out again
        without it. What you put here is yours: nobody else analysing this sale sees it.
      </p>
      <div className="mt-3">
        <Input
          id={`reason-${comparableId}`}
          name="reason"
          label="Why it does not belong"
          hint="For example, it is a different model, or the photographs show damage this lot does not have."
        />
      </div>
      {said && failed ? (
        <InfoNote tone="warning" className="mt-3">
          {said}
        </InfoNote>
      ) : null}
      <div className="mt-3 flex gap-3">
        <Button type="submit" loading={working}>
          {working ? 'Saving' : 'Set it aside'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} disabled={working}>
          Leave it counted
        </Button>
      </div>
    </form>
  );
}

/** What happened, said once and politely out of the way. */
function Spoken({ said, failed }: { said: string | null; failed: boolean }) {
  if (!said) return null;
  if (failed) {
    return (
      <InfoNote tone="warning" className="mt-2">
        {said}
      </InfoNote>
    );
  }
  return (
    <p className="mt-2 font-sans text-sm text-ink-muted" aria-live="polite">
      {said}
    </p>
  );
}
