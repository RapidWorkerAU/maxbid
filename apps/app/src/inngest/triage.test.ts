import { describe, expect, it } from 'vitest';
import { detailsFrom } from './triage';

describe('what the catalogue already told us', () => {
  const raw = {
    title: '2015 Invented Wagon Alpha Diesel',
    lotUrl: 'https://www.grays.com/lot/0001-23502418/x/y',
    imageUrl: 'https://res3.grays.com/handlers/imagehandler.ashx?id=1',
    currentBid: 1609,
    location: 'Jandakot, WA',
    noReserve: true,
    closesAt: '2026-09-29T11:30:00.000Z',
    closesAtSource: 'countdown',
  };

  it('passes on the facts about the lot', () => {
    expect(detailsFrom(raw)).toEqual({
      currentBid: 1609,
      location: 'Jandakot, WA',
      noReserve: true,
      closesAt: '2026-09-29T11:30:00.000Z',
    });
  });

  it('leaves out the links and the title', () => {
    // The title is already in the prompt on its own line, and a URL is a
    // hundred tokens of nothing on every lot of every catalogue.
    const details = detailsFrom(raw);
    expect(details).not.toHaveProperty('lotUrl');
    expect(details).not.toHaveProperty('imageUrl');
    expect(details).not.toHaveProperty('title');
  });

  it('leaves out how we worked out the closing time', () => {
    // Ours, not the auction's. The model has no use for it.
    expect(detailsFrom(raw)).not.toHaveProperty('closesAtSource');
  });

  it('leaves out anything the catalogue did not say', () => {
    expect(detailsFrom({ currentBid: null, location: undefined })).toEqual({});
  });

  it.each([null, undefined, 'a string', 42])('copes with raw being %s', (raw) => {
    expect(detailsFrom(raw)).toEqual({});
  });
});
