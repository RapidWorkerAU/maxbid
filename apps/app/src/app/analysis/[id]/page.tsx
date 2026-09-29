import { AppShell } from '@maxbid/ui/sections/AppShell';
import { TriageTable } from '@maxbid/ui/sections/TriageTable';
import { notFound } from 'next/navigation';
import { AnalysisProgress } from './AnalysisProgress';
import { pendingNoteFor, toRows } from './lots';
import { APP_LINKS } from '../../../lib/navigation';
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

  const [lots, identifications] = await Promise.all([
    supabase
      .from('lots')
      .select('id, lot_number, title, current_bid, closes_at')
      .eq('auction_id', data.auction_id)
      .order('lot_number'),
    supabase
      .from('lot_identifications')
      .select('lot_id, brand, model, year, confidence, condition_notes')
      .eq('analysis_id', id)
      .eq('is_current', true),
  ]);

  const rows = toRows(lots.data ?? [], identifications.data ?? []);
  const identified = rows.filter((row) => row.identifiedAs).length;

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
          caption="Lots in this catalogue"
          pendingNote={pendingNoteFor(identified, rows.length)}
        />
      ) : null}
    </AppShell>
  );
}
