'use client';

import { Button } from '@maxbid/ui/primitives/Button';
import { InfoNote } from '@maxbid/ui/primitives/InfoNote';
import { Input } from '@maxbid/ui/primitives/Input';
import { useActionState } from 'react';
import { submitAnalysis, type SubmitResult } from '../../lib/submit';

export function SubmitForm() {
  const [state, action, pending] = useActionState<SubmitResult, FormData>(submitAnalysis, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        id="url"
        name="url"
        type="url"
        label="Auction catalogue link"
        hint="Paste the link to a Grays or Lloyds catalogue. We read every lot on it."
        placeholder="https://www.grays.com/sale/..."
        autoComplete="off"
        required
        error={state?.error}
      />
      <div>
        <Button type="submit" loading={pending}>
          {pending ? 'Starting the analysis' : 'Analyse this catalogue'}
        </Button>
      </div>
      <InfoNote>
        Reading a catalogue takes a few minutes. You can leave this page and we
        will keep working.
      </InfoNote>
    </form>
  );
}
