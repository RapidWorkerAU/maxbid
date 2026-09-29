import { AppShell } from '@maxbid/ui/sections/AppShell';
import { redirect } from 'next/navigation';
import { SetupForm } from './SetupForm';
import { saveSetup } from '../../lib/setup';
import { APP_LINKS } from '../../lib/navigation';
import { supabaseServer } from '../../lib/supabase';

// SC16. Asks for the two figures nothing can be calculated without.
// Decision record 0022: MaxBid invents neither.
export default async function SetupPage() {
  const supabase = await supabaseServer();

  const { data } = await supabase
    .from('organisation_members')
    .select('org_id, organisations(name)')
    .limit(1)
    .maybeSingle();

  // No organisation means the gate sent them here too early.
  if (!data) redirect('/welcome');

  return (
    <AppShell links={APP_LINKS} currentPath="/">
      <SetupForm
        organisationName={data.organisations?.name ?? 'your organisation'}
        action={saveSetup}
      />
    </AppShell>
  );
}
