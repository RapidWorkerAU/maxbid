import { AppShell } from '@maxbid/ui/sections/AppShell';
import { TriageTable } from '@maxbid/ui/sections/TriageTable';
import { notFound } from 'next/navigation';
import { AnalysisProgress } from './AnalysisProgress';
import { readCatalogue } from './readCatalogue';
import { APP_LINKS } from '../../../lib/navigation';
import { askForFreshBids } from '../../../lib/askForFreshBids';
import { supabaseServer } from '../../../lib/supabase';

// SC04 and SC05. Progress while the pipeline runs, then the lots themselves.
// ux-standards.md asks for stage names and a notice that the user may leave.
export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data } = await supabase
    .from('analyses')
    .select('id, status, progress_pct, auction_id, auctions(title, source_url)')
    .eq('id', id)
    .maybeSingle();

  if (!data) notFound();

  const { rows, note } = await readCatalogue(supabase, id, data.auction_id, data.status);

  // Somebody is looking at this sale, so ask for its bids if they are due a
  // re-read. Decision record 0026.
  //
  // This waits for the ask, which is a query and an event, and not for the
  // page fetch, which takes seconds and happens in the background. The note
  // above already says how old the figures are, and the fresher ones arrive on
  // the next poll.
  await askForFreshBids(data.auction_id);

  return (
    <AppShell links={APP_LINKS} currentPath="/new">
      <AnalysisProgress
        status={data.status}
        progress={data.progress_pct}
        title={data.auctions?.title ?? null}
        sourceUrl={data.auctions?.source_url ?? null}
        lotCount={rows.length}
      />
      {rows.length > 0 ? (
        <TriageTable
          className="mt-10"
          lots={rows}
          hrefFor={(lotId) => `/analysis/${id}/lot/${lotId}`}
          caption="Lots in this catalogue"
          pendingNote={note || undefined}
        />
      ) : null}
    </AppShell>
  );
}
