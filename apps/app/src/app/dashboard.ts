// Shaping what the dashboard shows. SC02.
//
// Apart from the page so the page stays under the 80 line limit, and so the
// wording rules can be tested without a database.

import { stageFor, type AnalysisStatus } from '../lib/stages';

export type AnalysisCard = {
  id: string;
  title: string;
  status: string;
  lots: number;
  /** How many lots we have a bid figure for. */
  withFigures: number;
  createdAt: string;
};

/** How long ago, in words a person says rather than a timestamp. */
export function agoInWords(when: string, now: Date = new Date()): string {
  const then = new Date(when).getTime();
  if (!Number.isFinite(then)) return 'At an unknown time';

  const minutes = Math.round((now.getTime() - then) / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.round(hours / 24);
  if (days < 31) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
}

/**
 * What one analysis card says it is doing.
 *
 * A card that is still working says the stage it is on, because that is the
 * useful thing to know about an analysis you are waiting for. A finished one
 * says what it found, because that is the useful thing about one you might
 * go back to.
 *
 * A finished analysis with no figures says so plainly rather than saying it
 * is ready. Calling an empty list ready is the same error the triage status
 * made before it had its own valuing stage.
 */
export function cardNote(card: AnalysisCard): string {
  const stage = stageFor(card.status as AnalysisStatus);
  if (!stage.settled) return stage.detail;

  if (card.lots === 0) {
    return 'We could not read any lots from this catalogue.';
  }
  if (card.withFigures === 0) {
    return `We read ${card.lots} ${card.lots === 1 ? 'lot' : 'lots'} and could not find enough evidence to put a figure on any of them yet.`;
  }
  return `We read ${card.lots} ${card.lots === 1 ? 'lot' : 'lots'} and worked out a bid figure for ${card.withFigures} of them.`;
}

/**
 * The sentence about the credit balance. F17.
 *
 * One credit is one deep analysed lot, said every time rather than assumed,
 * because a balance in a unit the reader has to remember is a balance they
 * have to translate.
 */
export function creditNote(credits: number): string {
  if (credits <= 0) {
    return 'You have no credits left. A credit pays for one lot to be analysed in full.';
  }
  const lots = credits === 1 ? '1 lot' : `${credits} lots`;
  return `You have ${credits === 1 ? '1 credit' : `${credits} credits`}, which pays for ${lots} to be analysed in full.`;
}
