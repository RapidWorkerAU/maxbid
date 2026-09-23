import { MonoLabel } from '@maxbid/ui/primitives/MonoLabel';
import type { Metadata } from 'next';
import { OrganisationForm } from './OrganisationForm';

export const metadata: Metadata = { title: 'Create your organisation' };

// F02. Every user belongs to an organisation, and data is scoped to it.
// This is step one of the three step setup in SC16.
export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <MonoLabel>Step 1 of 3</MonoLabel>
      <div>
        <h1 className="font-sans text-2xl font-bold">Create your organisation</h1>
        <p className="mt-2 text-ink-muted">
          An organisation holds your analyses, your cost profiles and your
          watchlist. You can invite other people to it later.
        </p>
      </div>
      <OrganisationForm />
    </main>
  );
}
