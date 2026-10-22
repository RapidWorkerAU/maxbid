// Every photo on a Grays lot page. F18, D10.
//
// The catalogue card gives one thumbnail. A lot page carries the whole set,
// which on a real 2019 RAM was 32 photos: every panel, the interior, the
// odometer and the compliance plate. D10 exists because a model number is
// often only legible on a plate in a photograph, so the photographs are the
// identification rather than an illustration of it.
//
// Written against a real page rather than a guess. On that page 44 image
// markups matched the photo host, and only 40 of them were this lot: the
// other four were site furniture.
//
// The rule is positive. A photo counts because its alt text is the lot's own
// title, not because it failed to look like chrome. The last time an
// extractor here was written the other way round it read the words "cannot be
// altered or withdrawn" in the bidding terms and threw away every result on
// the page.

/** The hosts Grays serves lot photography from. */
const PHOTO =
  /!\[([^\]]*)\]\((https:\/\/res\d+\.grays\.com\/handlers\/imagehandler\.ashx[^)\s]*)\)/g;

export type LotPhoto = {
  url: string;
  /** The order they appear in, which is the order Grays chose to show them. */
  position: number;
};

/**
 * The lot's own photographs, in page order, each one once.
 *
 * Grays serves the same photograph at several sizes and the page uses more
 * than one of them, so the same picture appears two or three times with the
 * same id. Deduplicating on that id is what turns 40 markups into 32 photos.
 * Without it we would send a model the same image repeatedly and pay for it
 * each time.
 */
export function photosFrom(markdown: string, lotTitle: string): LotPhoto[] {
  const wanted = lotTitle.trim();
  if (!wanted) return [];

  const seen = new Set<string>();
  const photos: LotPhoto[] = [];

  for (const match of markdown.matchAll(PHOTO)) {
    const [, alt, url] = match;
    if (alt?.trim() !== wanted) continue;

    // The id is the photograph. Everything else in the query string is how
    // that photograph is being served.
    const id = new URL(url!).searchParams.get('id');
    if (!id || seen.has(id)) continue;

    seen.add(id);
    photos.push({ url: url!, position: photos.length });
  }

  return photos;
}
