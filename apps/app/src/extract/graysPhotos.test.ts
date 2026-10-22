// Reading every photo off a Grays lot page. F18, D10.
//
// The fixture is built the way a real page is built, with invented names,
// because D44 keeps third party listing content out of the repository. The
// shape, the host, the repeated sizes and the site furniture are all taken
// from a real 2019 lot page fetched on 22 October 2026, which carried 44
// photo markups of which 40 were the lot and 32 were distinct photographs.

import { describe, expect, it } from 'vitest';
import { photosFrom } from './graysPhotos';

const TITLE = '2019 Invented Hauler Alpha Diesel';

/** One photo markup, the way Grays writes them. */
const photo = (id: number, size = 'fl', alt = TITLE, host = 1) =>
  `![${alt}](https://res${host}.grays.com/handlers/imagehandler.ashx?t=sh&id=${id}&s=${size}&index=0&ts=639259030920000000)`;

const page = [
  '# ' + TITLE,
  photo(500001),
  photo(500002, 'fl', TITLE, 2),
  photo(500003, 'fl', TITLE, 0),
  // The same photographs again at another size, which the page does.
  photo(500001, 'we'),
  photo(500002, 'we', TITLE, 3),
  // Site furniture: an icon and a spacer, neither of them this lot.
  '![](https://res1.grays.com/handlers/imagehandler.ashx?t=sh&id=9765&s=d)',
  '![(none)](https://res2.grays.com/handlers/imagehandler.ashx?t=sh&id=0&s=vl)',
  '**Current bid:** $12,000',
].join('\n\n');

describe('the photographs on a lot page', () => {
  it('finds the lot photos', () => {
    expect(photosFrom(page, TITLE)).toHaveLength(3);
  });

  it('keeps them in the order the page shows them', () => {
    const photos = photosFrom(page, TITLE);
    expect(photos.map((p) => p.position)).toEqual([0, 1, 2]);
    expect(photos[0]!.url).toContain('id=500001');
    expect(photos[2]!.url).toContain('id=500003');
  });

  it('counts a photograph once however many sizes the page uses', () => {
    // Grays serves the same picture at several sizes and the page uses more
    // than one. Without this we would send a model the same image two or
    // three times and pay for it each time.
    const urls = photosFrom(page, TITLE).map((p) => p.url);
    expect(urls.filter((url) => url.includes('id=500001'))).toHaveLength(1);
  });

  it('leaves out the site furniture', () => {
    // The rule is positive: a photo counts because its alt text is the lot's
    // own title, not because it failed to look like an icon. An extractor
    // written the other way round once read "cannot be altered or withdrawn"
    // out of the bidding terms and threw away every result on the page.
    const ids = photosFrom(page, TITLE).map((p) => p.url);
    expect(ids.some((url) => url.includes('id=9765'))).toBe(false);
    expect(ids.some((url) => url.includes('id=0&'))).toBe(false);
  });
});

describe('when there is nothing to read', () => {
  it('finds nothing on a page with no photographs', () => {
    expect(photosFrom('# A lot with no pictures', TITLE)).toEqual([]);
  });

  it('finds nothing when we do not know what the lot is called', () => {
    // Without a title there is no way to tell this lot's photographs from
    // the ones around them, and guessing would attach another lot's pictures
    // to this one.
    expect(photosFrom(page, '')).toEqual([]);
    expect(photosFrom(page, '   ')).toEqual([]);
  });

  it('finds nothing when the title does not match the page', () => {
    expect(photosFrom(page, 'A different lot entirely')).toEqual([]);
  });

  it('ignores an image served from somewhere else', () => {
    const elsewhere = `![${TITLE}](https://images.example.test/photo.jpg)`;
    expect(photosFrom(elsewhere, TITLE)).toEqual([]);
  });
});
