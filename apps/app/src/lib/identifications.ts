// Which identification of a lot to read. Decision record 0024.
//
// An identification has two kinds. A null analysis is the shared baseline
// every organisation reads. An analysis id is one organisation's own
// correction, which stays theirs. Both can be current at once, because they
// answer different questions: what the lot is, and what this organisation
// says it is.
//
// In lib rather than beside the pipeline because the background jobs and the
// screen must answer that question the same way. Two copies of this rule
// would mean a user could be shown one identification and have their bid
// figure worked out from another.

/**
 * One identification per lot, preferring this organisation's own correction.
 *
 * A correction wins over the baseline because the organisation knows
 * something about the lot that we do not.
 *
 * The result must not depend on the order the rows arrived in, which is why
 * it checks what it already holds rather than overwriting as it goes.
 */
export function preferCorrection<T extends { lot_id: string; analysis_id: string | null }>(
  rows: T[],
): T[] {
  const byLot = new Map<string, T>();
  for (const row of rows) {
    const held = byLot.get(row.lot_id);
    if (held && held.analysis_id !== null) continue;
    byLot.set(row.lot_id, row);
  }
  return [...byLot.values()];
}

/**
 * Whether a stored row actually says what the lot is.
 *
 * A row that named neither a brand nor a model is a record that we tried, not
 * an identification. It matters because the baseline is read by everybody: a
 * failed reading treated as an answer would be carried forward to every
 * organisation that ever looks at the lot, and nothing would try again.
 */
export function namesSomething(row: { brand: string | null; model: string | null }): boolean {
  return Boolean(row.brand || row.model);
}
