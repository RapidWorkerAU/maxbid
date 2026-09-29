'use server';

import { redirect } from 'next/navigation';
import { supabaseServer } from './supabase';
import { readSetup } from './setupValues';
import type { ActionResult } from './actions';

/**
 * Saves the two things nothing can be calculated without. SC16, F04.
 *
 * Decision record 0022: MaxBid invents neither a profit target nor a GST
 * position, because a default profit target is a guess about somebody else's
 * business and every cost only ever reduces a bid figure.
 */
export async function saveSetup(
  _previous: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const values = readSetup(form);
  if ('error' in values) return values;

  const supabase = await supabaseServer();

  const membership = await supabase
    .from('organisation_members')
    .select('org_id')
    .limit(1)
    .maybeSingle();
  if (!membership.data) {
    return { error: 'We could not tell which organisation to save this to. Please reload.' };
  }

  const org = await supabase
    .from('organisations')
    .update({ gst_registered: values.gstRegistered })
    .eq('id', membership.data.org_id);
  if (org.error) {
    return { error: 'We could not save your GST setting. Please try again.' };
  }

  // An organisation created before decision record 0022 has no profile at
  // all, so this has to write one rather than update nothing. An update that
  // matches no rows reports success, which would tell the user their figures
  // were saved when they were not.
  const existing = await supabase
    .from('cost_profiles')
    .select('id')
    .eq('org_id', membership.data.org_id)
    .eq('is_default', true)
    .maybeSingle();

  const figures = {
    profit_mode: values.profitMode,
    target_profit_amount: values.targetAmount,
    min_profit_amount: values.minimumAmount,
    target_return_pct: values.targetPct,
    min_return_pct: values.minimumPct,
    completed_at: new Date().toISOString(),
  };

  const profile = existing.data
    ? await supabase.from('cost_profiles').update(figures).eq('id', existing.data.id)
    : await supabase.from('cost_profiles').insert({
        ...figures,
        org_id: membership.data.org_id,
        name: 'Default',
        is_default: true,
      });

  if (profile.error) {
    return { error: 'We could not save your profit target. Please try again.' };
  }

  redirect('/');
}
