import { AppShell } from '@maxbid/ui/sections/AppShell';
import { TriageTable } from '@maxbid/ui/sections/TriageTable';
import { notFound } from 'next/navigation';
import { AnalysisProgress } from './AnalysisProgress';
import { bidFreshnessNote, pendingNoteFor, toRows } from './lots';
import { APP_LINKS } from '../../../lib/navigation';
import { preferCorrection } from '../../../lib/identifications';
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

  // What a lot is and what it resells for are shared, because neither depends
  // on who is buying. The maximum bid and the score are this organisation's
  // own. Decision record 0024.
  const [lots, identifications, ranges, shared] = await Promise.all([
    supabase
      .from('lots')
      .select('id, lot_number, title, current_bid, closes_at, bid_checked_at')
      .eq('auction_id', data.auction_id)
      .order('lot_number'),
    supabase
      .from('lot_identifications')
      .select(
        'lot_id, brand, model, year, confidence, condition_notes, analysis_id, lots!inner(auction_id)',
      )
      .eq('lots.auction_id', data.auction_id)
      .eq('is_current', true)
      .or(`analysis_id.is.null,analysis_id.eq.${id}`),
    supabase
      .from('analysis_lots')
      .select('lot_id, triage_low, triage_high, triage_max_bid, opportunity_score')
      .eq('analysis_id', id),
    supabase
      .from('triage_valuations')
      .select('lot_id, conservative, optimistic, lots!inner(auction_id)')
      .eq('lots.auction_id', data.auction_id)
      .eq('is_current', true),
  ]);

  const rows = toRows(
    lots.data ?? [],
    preferCorrection(identifications.data ?? []),
    ranges.data ?? [],
    shared.data ?? [],
  );
  const identified = rows.filter((row) => row.identifiedAs).length;
  const checked = bidFreshnessNote(lots.data ?? []);
  const note = [pendingNoteFor(identified, rows.length), checked].filter(Boolean).join(' ');

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
