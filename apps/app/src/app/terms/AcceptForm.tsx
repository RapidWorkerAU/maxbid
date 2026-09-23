'use client';

import { Button } from '@maxbid/ui/primitives/Button';
import { useActionState } from 'react';
import { acceptTerms, type ActionResult } from '../../lib/actions';

export function AcceptForm({ version }: { version: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(acceptTerms, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="version" value={version} />
      <Button type="submit" loading={pending}>
        {pending ? 'Recording your acceptance' : 'I accept these terms'}
      </Button>
      {state && 'error' in state ? (
        <p role="alert" className="text-sm text-zone-red">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
