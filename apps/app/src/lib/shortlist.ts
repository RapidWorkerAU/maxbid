'use server';

// Saving which lots somebody wants analysed in full. F17.
//
// Deep analysis is Week 5 and does not exist yet, so this saves the choice
// and spends nothing. Credits are reserved when deep analysis starts, per
// commercial.md, and nothing has started.
//
// Saving it anyway is the point. A tick box that forgets what you ticked the
// moment you reload is not a shortlist, and somebody going through three
// hundred lots is doing an hour of work they would lose.

import { createServiceSupabase } from '@maxbid/db/server';
import { supabaseServer } from './supabase';

export type ShortlistResult = { error: string } | { saved: number };

export async function saveShortlist(
  analysisId: string,
  lotIds: string[],
): Promise<ShortlistResult> {
  const supabase = await supabaseServer();

  // Read through the user's own client, so row level security answers whether
  // this analysis is theirs. The write then goes through the service role,
  // because analysis_lots has no update policy: everything on it is written
  // by the pipeline, and this is the one thing the user decides.
  const { data: analysis } = await supabase
    .from('analyses')
    .select('id')
    .eq('id', analysisId)
    .maybeSingle();
  if (!analysis) return { error: 'We could not find that analysis.' };

  const service = createServiceSupabase();

  // Everything back to triaged first, so unticking a lot takes it off the
  // shortlist. Without this the shortlist could only ever grow.
  const cleared = await service
    .from('analysis_lots')
    .update({ status: 'triaged' })
    .eq('analysis_id', analysisId)
    .eq('status', 'shortlisted');
  if (cleared.error) return { error: 'We could not save your shortlist. Please try again.' };

  if (lotIds.length === 0) return { saved: 0 };

  const { error } = await service
    .from('analysis_lots')
    .update({ status: 'shortlisted' })
    .eq('analysis_id', analysisId)
    .in('lot_id', lotIds);
  if (error) return { error: 'We could not save your shortlist. Please try again.' };

  return { saved: lotIds.length };
}
