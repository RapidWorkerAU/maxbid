// Turning an identification into something worth searching for. S5, F14.
//
// The query decides what comes back, so it is built from the identification
// rather than from the catalogue title. The catalogue title carries auction
// noise, for example "(WOVR-INSPECTED)", and searching for that finds other
// auctions rather than the prices people actually pay.

export type QuerySubject = {
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  specs?: Record<string, unknown> | null;
};

/**
 * The specs worth searching on, in the order they help.
 *
 * Fuel and transmission separate a diesel from a petrol of the same name,
 * which are different money. An odometer reading does not belong in a query:
 * it is a number nobody searches for and it would match almost nothing.
 */
const USEFUL_SPECS = ['fuel', 'transmission', 'trim', 'variant', 'body', 'capacity'];

const text = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Builds the search for a lot.
 *
 * Returns null when there is not enough to search on. A search for a year and
 * nothing else returns a page of unrelated cars, and pricing a lot against
 * them would be worse than admitting we do not know what it is.
 */
export function queryFor(subject: QuerySubject): string | null {
  const brand = text(subject.brand);
  const model = text(subject.model);
  if (!brand && !model) return null;

  const parts: string[] = [];
  if (subject.year) parts.push(String(subject.year));
  if (brand) parts.push(brand);
  if (model) parts.push(model);

  // Compared word by word rather than phrase by phrase. The model often comes
  // back as "Outlander Exceed" with a trim of "Exceed", and comparing whole
  // phrases would miss that and search for "Exceed" twice.
  const said = new Set(parts.join(' ').toLowerCase().split(/\s+/));

  for (const key of USEFUL_SPECS) {
    const value = text(subject.specs?.[key]);
    if (!value) continue;
    const words = value.toLowerCase().split(/\s+/);
    if (words.every((word) => said.has(word))) continue;
    parts.push(value);
    for (const word of words) said.add(word);
  }

  // "for sale" pulls listings rather than reviews and specification pages.
  // "australia" keeps the prices in the currency the bid is made in.
  return `${parts.join(' ')} for sale australia`;
}
