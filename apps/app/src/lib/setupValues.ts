// Reading and checking what the setup form sent.
//
// Apart from the action so it can be tested without a database, and because a
// "use server" file may only export async functions.

export type SetupValues = {
  gstRegistered: boolean;
  profitMode: 'dollars' | 'percent';
  /** Set when the target is in dollars. Null when it is a return. */
  targetAmount: number | null;
  minimumAmount: number | null;
  /** Set when the target is a return, as a fraction. 30 percent is 0.3. */
  targetPct: number | null;
  minimumPct: number | null;
};

const number = (value: FormDataEntryValue | null): number | null => {
  const text = String(value ?? '').trim();
  if (text.length === 0) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Reads the form, or says what is wrong with it.
 *
 * The messages name the field and what to do, per CP11. None of them blames
 * the user for a blank, because a blank is a question we have not asked well
 * enough.
 */
export function readSetup(form: FormData): SetupValues | { error: string } {
  const profitMode = String(form.get('profitMode') ?? '');
  if (profitMode !== 'dollars' && profitMode !== 'percent') {
    return { error: 'Choose whether you set your profit target in dollars or as a return on cost.' };
  }

  const target = number(form.get('target'));
  const minimum = number(form.get('minimum'));

  if (target === null) {
    return { error: 'Enter the profit you are aiming for. It sets your target bid.' };
  }
  if (minimum === null) {
    return { error: 'Enter the least profit you would accept. It sets your limit bid.' };
  }
  if (target < 0 || minimum < 0) {
    return { error: 'A profit target cannot be less than nothing. Enter zero or more.' };
  }
  if (minimum > target) {
    // Not a typo we should silently swap. The two figures mean different
    // things and the wrong way round would put the limit bid below the target.
    return {
      error:
        'The least profit you would accept is higher than the profit you are aiming for. Check the two figures.',
    };
  }

  const gstRegistered = String(form.get('gstRegistered') ?? '') === 'yes';

  if (profitMode === 'dollars') {
    return {
      gstRegistered,
      profitMode,
      targetAmount: target,
      minimumAmount: minimum,
      targetPct: null,
      minimumPct: null,
    };
  }

  // The form asks for a percentage because that is how people say it. The
  // calculator works in fractions, so 30 becomes 0.3 here rather than
  // somewhere later where the unit would be anybody's guess.
  return {
    gstRegistered,
    profitMode,
    targetAmount: null,
    minimumAmount: null,
    targetPct: target / 100,
    minimumPct: minimum / 100,
  };
}
