import { describe, expect, it } from 'vitest';
import { detectPlatform } from './platforms';

describe('supported auction houses', () => {
  it('recognises Grays', () => {
    for (const url of [
      'https://www.grays.com/sale/12345/woodworking-machinery',
      'https://grays.com/lot/98765',
    ]) {
      expect(detectPlatform(url)).toEqual({ supported: true, slug: 'grays' });
    }
  });

  it('recognises Lloyds', () => {
    expect(detectPlatform('https://www.lloydsauctions.com.au/auction/4821')).toEqual({
      supported: true,
      slug: 'lloyds',
    });
  });

  it('ignores case in the host', () => {
    expect(detectPlatform('https://WWW.GRAYS.COM/sale/1')).toEqual({
      supported: true,
      slug: 'grays',
    });
  });

  it('ignores surrounding whitespace, because people paste', () => {
    expect(detectPlatform('  https://www.grays.com/sale/1  ')).toEqual({
      supported: true,
      slug: 'grays',
    });
  });
});

describe('Pickles is refused, and says why', () => {
  // Decision record 0012. Their terms prohibit automated access, so this is
  // not an unsupported site, it is one we may not touch.
  it('refuses a Pickles link', () => {
    const result = detectPlatform('https://www.pickles.com.au/general/item/x/itemid-1/lotid-2');
    expect(result.supported).toBe(false);
    expect(result.supported === false && result.reason).toContain('terms of use do not allow it');
  });

  it('offers the PDF route instead', () => {
    const result = detectPlatform('https://pickles.com.au/anything');
    expect(result.supported === false && result.reason).toContain('PDF');
  });
});

describe('anything else gets a clear message, per F05', () => {
  it('refuses an auction house we do not support', () => {
    const result = detectPlatform('https://www.manheim.com.au/sale/1');
    expect(result.supported).toBe(false);
    expect(result.supported === false && result.reason).toContain('PDF');
  });

  it('refuses something that is not a link at all', () => {
    const result = detectPlatform('grays woodworking machinery');
    expect(result.supported === false && result.reason).toContain('does not look like a link');
  });

  it('refuses an empty box', () => {
    expect(detectPlatform('').supported).toBe(false);
  });

  it('refuses a link that is not web traffic', () => {
    const result = detectPlatform('ftp://www.grays.com/sale/1');
    expect(result.supported === false && result.reason).toContain('https');
  });

  it('is not fooled by a host that merely contains a supported name', () => {
    expect(detectPlatform('https://grays.com.evil.example/sale/1').supported).toBe(false);
    expect(detectPlatform('https://notgrays.com/sale/1').supported).toBe(false);
  });
});
