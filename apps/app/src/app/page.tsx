import { AppShell } from '@maxbid/ui/sections/AppShell';
import { ButtonLink } from '@maxbid/ui/primitives/Button';
import { DetailCard } from '@maxbid/ui/composites/DetailCard';
import { InfoNote } from '@maxbid/ui/primitives/InfoNote';
import { AnalysisCards } from './AnalysisCards';
import { creditNote } from './dashboard';
import { readDashboard } from './readDashboard';
import { APP_LINKS } from '../lib/navigation';
import { supabaseServer } from '../lib/supabase';

// SC02. Recent analyses and the credit balance. The watchlist joins them with
// F35, which is Week 7.
export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const read = await readDashboard(supabase);

  if (!read) {
    return (
      <AppShell links={APP_LINKS} currentPath="/">
        <h1 className="font-sans text-2xl font-bold">Dashboard</h1>
        <InfoNote className="mt-4">
          You are not in an organisation yet, so there is nothing to show here.
        </InfoNote>
      </AppShell>
    );
  }

  return (
    <AppShell links={APP_LINKS} currentPath="/" footer={read.organisation}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 font-sans text-ink-muted">
            You are signed in to {read.organisation} as {read.role}.
          </p>
        </div>
        <ButtonLink href="/new">Analyse a catalogue</ButtonLink>
      </div>

      <DetailCard className="mt-8" label="Credits" heading="What you have left">
        <p className="font-sans text-base text-ink">{creditNote(read.credits)}</p>
      </DetailCard>

      <AnalysisCards className="mt-8" cards={read.cards} />
    </AppShell>
  );
}
