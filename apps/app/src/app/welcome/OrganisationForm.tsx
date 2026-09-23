'use client';

import { Button } from '@maxbid/ui/primitives/Button';
import { Input } from '@maxbid/ui/primitives/Input';
import { useActionState } from 'react';
import { createOrganisation, type ActionResult } from '../../lib/actions';

export function OrganisationForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createOrganisation,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        id="name"
        name="name"
        label="Organisation name"
        hint="Use your business name. Everyone you invite shares the analyses in this organisation."
        required
        error={state && 'error' in state ? state.error : undefined}
      />
      <Button type="submit" loading={pending}>
        {pending ? 'Creating your organisation' : 'Create my organisation'}
      </Button>
    </form>
  );
}
