import { AppShell } from '@maxbid/ui/sections/AppShell';
import { supabaseServer } from '../lib/supabase';

const LINKS = [
  { href: '/', label: 'Dashboard', icon: 'search' as const },
  { href: '/watchlist', label: 'Watchlist', icon: 'clock' as const },
  { href: '/outcomes', label: 'Outcomes', icon: 'check' as const },
];

// SC02. Recent analyses, the watchlist and the credit balance land here as
// those features arrive. For now it proves a signed in user is inside an
// organisation, which is the Week 1 exit criterion.
export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from('organisation_members')
    .select('role, organisations(name)')
    .limit(1)
    .maybeSingle();

  const organisation = data?.organisations?.name ?? 'your organisation';

  return (
    <AppShell links={LINKS} currentPath="/" footer={organisation}>
      <h1 className="font-sans text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 max-w-prose text-ink-muted">
        You are signed in to {organisation} as {data?.role ?? 'a member'}. Paste
        an auction catalogue link to start your first analysis once ingestion is
        built.
      </p>
    </AppShell>
  );
}
