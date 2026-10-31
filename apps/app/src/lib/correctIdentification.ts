'use server';

// Correcting what we decided a lot is. F19, D11.
//
// D11 says always let the user confirm or edit the identification, because
// corrections become matching data that improves future answers. It is also
// the only way a user can disagree with us about a lot: everything
// downstream, the search terms, the comparables and the match levels, is
// built on what we think the thing is.
//
// A correction belongs to the organisation that made it. The baseline is
// shared and nobody may write it, because one organisation's opinion about a
// lot is not a fact about the lot. Row level security enforces both: the
// insert policy requires an analysis, the user's own membership of it, the
// user stage and their own id as the person who confirmed it.

import { createServiceSupabase } from '@maxbid/db/server';
import { revalueRequested, inngest } from '../inngest/client';
import { supabaseServer } from './supabase';

export type Correction = {
  brand: string | null;
  model: string | null;
  year: number | null;
  conditionNotes: string | null;
};

export type CorrectionResult = { error: string } | { saved: true };

/** Trimmed, with an empty box read as nothing rather than as an empty answer. */
function asText(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? '').trim();
  return text === '' ? null : text;
}

export async function correctIdentification(
  analysisId: string,
  lotId: string,
  form: FormData,
): Promise<CorrectionResult> {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: 'Your session has expired. Please sign in again.' };

  const brand = asText(form.get('brand'));
  const model = asText(form.get('model'));

  // A correction that names neither is not a correction, it is an erasure,
  // and it would leave the lot worse identified than the baseline we already
  // had. The baseline is still there either way, so there is nothing to lose
  // by refusing this.
  if (!brand && !model) {
    return { error: 'Give at least a make or a model, so we know what to search for.' };
  }

  const yearText = asText(form.get('year'));
  const year = yearText === null ? null : Number(yearText);
  if (yearText !== null && (!Number.isInteger(year) || year! < 1900 || year! > 2100)) {
    return { error: 'Give the year as a four digit number, or leave it blank.' };
  }

  // Through the service role, because superseding the organisation's previous
  // correction is an update and the update policy guards it by analysis. The
  // read above is what proves the analysis is theirs.
  const { data: analysis } = await supabase
    .from('analyses')
    .select('id')
    .eq('id', analysisId)
    .maybeSingle();
  if (!analysis) return { error: 'We could not find that analysis.' };

  const service = createServiceSupabase();

  // Only one correction may be current per lot per analysis, so the old one
  // steps down before the new one arrives. The unique index makes that a rule
  // rather than a convention.
  await service
    .from('lot_identifications')
    .update({ is_current: false })
    .eq('analysis_id', analysisId)
    .eq('lot_id', lotId)
    .eq('is_current', true);

  const { error } = await service.from('lot_identifications').insert({
    analysis_id: analysisId,
    lot_id: lotId,
    stage: 'user',
    brand,
    model,
    year: year ?? null,
    condition_notes: asText(form.get('conditionNotes')),
    // Theirs, so we are as sure of it as they are. The confidence score that
    // weights the ranking reads this, and somebody who has looked at the lot
    // knows better than a model that read its photographs.
    confidence: 100,
    confirmed_by: auth.user.id,
  });
  if (error) return { error: 'We could not save your correction. Please try again.' };

  // F19 says an edit triggers a revaluation. A corrected identification that
  // left the old figures on screen would be worse than no correction at all,
  // because the figures would now be attributed to something the user had
  // told us was wrong.
  try {
    await inngest.send({
      name: revalueRequested.name,
      data: { analysisId, lotId },
    });
  } catch (cause) {
    console.error('Saved the correction but could not start the revaluation', cause);
    const why = cause instanceof Error ? cause.message : 'The reason was not given.';
    return { error: `We saved your correction but could not work the figures out again. ${why}` };
  }

  return { saved: true };
}
