import { AppShell } from '@maxbid/ui/sections/AppShell';
import { notFound } from 'next/navigation';
import { AnalysisProgress } from './AnalysisProgress';
import { FilteredLots } from './FilteredLots';
import { filtersFromParams } from '@maxbid/ui/composites/LotFilters';
import { readCatalogue } from './readCatalogue';
import { APP_LINKS } from '../../../lib/navigation';
import { askForFreshBids } from '../../../lib/askForFreshBids';
import { supabaseServer } from '../../../lib/supabase';

/**
 * A repeated query parameter arrives as an array, and a filter reads one
 * value. The first is what a browser would have sent on its own.
 */
function onlyStrings(
  query: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return flat;
}

// SC04 and SC05. Progress while the pipeline runs, then the lots themselves.
// ux-standards.md asks for stage names and a notice that the user may leave.
export default async function AnalysisPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await supabaseServer();

  const { data } = await supabase
    .from('analyses')
    .select('id, status, progress_pct, auction_id, org_id, auctions(title, source_url)')
    .eq('id', id)
    .maybeSingle();

  if (!data) notFound();

  const { rows, note } = await readCatalogue(supabase, id, data.auction_id, data.status);

  // What this organisation has left to spend on deep analysis. F17 shows it
  // before a shortlist is confirmed, because a charge somebody did not see
  // coming is a charge they did not agree to.
  const { data: credits } = await supabase.rpc('credits_available', {
    target_org: data.org_id,
  });

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
        <FilteredLots
          lots={rows}
          initialFilters={filtersFromParams(onlyStrings(query))}
          credits={credits ?? 0}
          analysisId={id}
          caption="Lots in this catalogue"
          pendingNote={note || undefined}
        />
      ) : null}
    </AppShell>
  );
}
