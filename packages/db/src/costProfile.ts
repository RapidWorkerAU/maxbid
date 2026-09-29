// What a cost profile has to say before a bid figure may be shown.
// Decision record 0022.
//
// Pure rules, kept out of the app so they can be tested without a database and
// so the app and the pipeline both answer the same way. Nothing here invents a
// figure: every question is answered from what the user has actually set.

/** The parts of a cost profile these rules read. */
export type CostProfileSettings = {
  profit_mode: string | null;
  target_profit_amount: number | string | null;
  target_return_pct: number | string | null;
  min_profit_amount: number | string | null;
  min_return_pct: number | string | null;
  completed_at: string | null;
};

/** A setting that has to be filled in, and what to call it on screen. */
export type MissingSetting = { field: string; label: string };

const number = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * What still has to be answered before any bid figure can be worked out.
 *
 * An empty list means the profile is usable. Anything in it is a question the
 * user has not been asked yet, and the screen names it rather than showing a
 * figure with a caveat beside it.
 */
export function missingForBidFigures(profile: CostProfileSettings | null): MissingSetting[] {
  if (!profile) {
    return [{ field: 'profile', label: 'A cost profile, which holds your profit target' }];
  }

  const missing: MissingSetting[] = [];

  if (profile.profit_mode !== 'dollars' && profile.profit_mode !== 'percent') {
    missing.push({
      field: 'profit_mode',
      label: 'Whether you set your profit target in dollars or as a return on cost',
    });
    return missing;
  }

  if (profile.profit_mode === 'dollars') {
    if (number(profile.target_profit_amount) === null) {
      missing.push({ field: 'target_profit_amount', label: 'The profit you are aiming for' });
    }
    if (number(profile.min_profit_amount) === null) {
      missing.push({
        field: 'min_profit_amount',
        label: 'The least profit you would accept, which sets your limit bid',
      });
    }
    return missing;
  }

  if (number(profile.target_return_pct) === null) {
    missing.push({ field: 'target_return_pct', label: 'The return on cost you are aiming for' });
  }
  if (number(profile.min_return_pct) === null) {
    missing.push({
      field: 'min_return_pct',
      label: 'The least return you would accept, which sets your limit bid',
    });
  }
  return missing;
}

/** True when every figure a bid needs has been chosen by the user. */
export function canShowBidFigures(profile: CostProfileSettings | null): boolean {
  return missingForBidFigures(profile).length === 0;
}

/**
 * One sentence saying what is missing, for the screen.
 *
 * Names the settings rather than saying the profile is incomplete, because
 * "incomplete" sends somebody looking for what, and the answer is right here.
 */
export function whatIsMissing(profile: CostProfileSettings | null): string | null {
  const missing = missingForBidFigures(profile);
  if (missing.length === 0) return null;

  const labels = missing.map((item) => item.label.toLowerCase());
  const list =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;

  return `We cannot work out what to bid until you tell us ${list}.`;
}
