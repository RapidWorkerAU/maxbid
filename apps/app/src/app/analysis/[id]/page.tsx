import { AppShell } from '@maxbid/ui/sections/AppShell';
import { notFound } from 'next/navigation';
import { AnalysisProgress } from './AnalysisProgress';
import { APP_LINKS } from '../../../lib/navigation';
import { supabaseServer } from '../../../lib/supabase';

// SC04. Shows extraction and triage progress. ux-standards.md asks for stage
// names and a notice that the user may leave the page.
export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data } = await supabase
    .from('analyses')
    .select('id, status, progress_pct, auction_id, auctions(title, source_url)')
    .eq('id', id)
    .maybeSingle();

  if (!data) notFound();

  const { count } = await supabase
    .from('lots')
    .select('id', { count: 'exact', head: true })
    .eq('auction_id', data.auction_id);

  return (
    <AppShell links={APP_LINKS} currentPath="/new">
      <AnalysisProgress
        status={data.status}
        progress={data.progress_pct}
        title={data.auctions?.title ?? null}
        sourceUrl={data.auctions?.source_url ?? null}
        lotCount={count ?? 0}
      />
    </AppShell>
  );
}
