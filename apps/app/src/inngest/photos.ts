// Collecting a lot's photographs. F18, D10.
//
// The catalogue card gives one thumbnail. D10 says the identification is
// text plus vision on the photographs, because a model number is often only
// legible on a compliance plate in a picture, and one thumbnail of the front
// three quarters never shows a plate.
//
// So before a model can read the photographs we have to have them, and that
// means one page fetch per lot. It is why this runs on a shortlist rather
// than on a catalogue: thirty two photographs each for three hundred lots is
// not a thing anybody needs.

import { createServiceSupabase } from '@maxbid/db/server';
import { fetchPage } from '../extract/firecrawl';
import { photosFrom } from '../extract/graysPhotos';

/**
 * How many photographs of one lot a model is given.
 *
 * A real lot page carried thirty two. Every one of them costs tokens, and
 * after the first handful they are the same car from a slightly different
 * angle. The plate and the odometer are usually in the first dozen because
 * Grays leads with the overview shots and follows with the detail.
 */
export const MOST_PHOTOS = 12;

/**
 * Reads a lot page and stores every photograph on it.
 *
 * Returns how many it stored. Nought means the page had none we could tie to
 * this lot, which is a real answer: some lots are listed without photographs
 * and a vision pass on them would find nothing.
 */
export async function collectPhotos(lot: {
  id: string;
  title: string;
  source_url: string | null;
}): Promise<number> {
  if (!lot.source_url) return 0;

  const page = await fetchPage(lot.source_url);
  const photos = photosFrom(page.markdown, lot.title);
  if (photos.length === 0) return 0;

  const supabase = createServiceSupabase();

  // Upsert on the lot and position rather than insert, so re-reading a page
  // replaces what we held instead of stacking a second copy beside it.
  const { error } = await supabase.from('lot_images').upsert(
    photos.map((photo) => ({ lot_id: lot.id, url: photo.url, position: photo.position })),
    { onConflict: 'lot_id,position' },
  );
  if (error) throw new Error(`Could not store the photographs: ${error.message}`);

  return photos.length;
}

/** The photographs we hold for a lot, in the order the page showed them. */
export async function photosFor(lotId: string, limit = MOST_PHOTOS): Promise<string[]> {
  const { data, error } = await createServiceSupabase()
    .from('lot_images')
    .select('url')
    .eq('lot_id', lotId)
    .order('position')
    .limit(limit);
  if (error) throw new Error(`Could not read the photographs: ${error.message}`);
  return (data ?? []).map((row) => row.url);
}
