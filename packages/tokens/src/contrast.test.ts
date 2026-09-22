// Asserts every colour pairing the design system documents.
//
// D102 commits the product to WCAG 2.2 AA everywhere. This test makes that
// claim checkable at the token level, before a single component exists, so a
// colour can never regress the way confidence_insufficient did.

import { describe, expect, it } from 'vitest';
import { AA_NORMAL_TEXT, contrast } from './contrast';
import { colors, fillText, onNavy } from './index';

const LIGHT_SURFACES = [
  ['page', colors.page],
  ['surface', colors.surface],
  ['surface_muted', colors.surfaceMuted],
] as const;

/** Text colours that may appear on any light surface. */
const ALWAYS_SAFE = [
  ['ink', colors.ink],
  ['ink_muted', colors.inkMuted],
  ['zone_red', colors.zoneRed],
  ['confidence_insufficient', colors.confidenceInsufficient],
  ['confidence_medium', colors.confidenceMedium],
] as const;

/**
 * Status and link colours. Decision record 0010 bars these from
 * surface_muted, where they fall below 4.5 to 1.
 */
const NOT_ON_SURFACE_MUTED = [
  ['link', colors.link],
  ['zone_green', colors.zoneGreen],
  ['zone_amber', colors.zoneAmber],
  ['confidence_high', colors.confidenceHigh],
  ['confidence_low', colors.confidenceLow],
] as const;

describe('light pages', () => {
  it.each(ALWAYS_SAFE)('%s reads on every light surface', (_name, colour) => {
    for (const [, surface] of LIGHT_SURFACES) {
      expect(contrast(colour, surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });

  it.each(NOT_ON_SURFACE_MUTED)('%s reads on the page and on white', (_name, colour) => {
    expect(contrast(colour, colors.page)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    expect(contrast(colour, colors.surface)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});

describe('navy panels', () => {
  const textOnNavy = [
    ['ink', onNavy.ink],
    ['ink_muted', onNavy.inkMuted],
    ['line', onNavy.line],
    ['link', onNavy.link],
    ['zone_green', onNavy.zoneGreen],
    ['zone_amber', onNavy.zoneAmber],
    ['zone_red', onNavy.zoneRed],
    ['confidence_high', onNavy.confidenceHigh],
    ['confidence_medium', onNavy.confidenceMedium],
    ['confidence_low', onNavy.confidenceLow],
    ['confidence_insufficient', onNavy.confidenceInsufficient],
  ] as const;

  it.each(textOnNavy)('%s reads on a navy panel', (_name, colour) => {
    expect(contrast(colour, colors.navy)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});

describe('text on fills', () => {
  it.each([
    ['accent', fillText.accent, colors.accent],
    ['tag_verified', fillText.tagVerified, colors.tagVerified],
    ['tag_extracted', fillText.tagExtracted, colors.tagExtracted],
    ['tag_estimated', fillText.tagEstimated, colors.tagEstimated],
    ['tag_your_input', fillText.tagYourInput, colors.tagYourInput],
  ] as const)('%s carries readable text', (_name, text, fill) => {
    expect(contrast(text, fill)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});

describe('the surface_muted constraint from decision record 0010', () => {
  // A canary, not a bug. These three are why the constraint exists. If this
  // test fails, surface_muted has been lightened enough that status and link
  // text now reads on it, and the constraint can be lifted.
  it.each(NOT_ON_SURFACE_MUTED.slice(0, 3))(
    '%s still falls short on surface_muted, so the rule still applies',
    (_name, colour) => {
      expect(contrast(colour, colors.surfaceMuted)).toBeLessThan(AA_NORMAL_TEXT);
    },
  );
});
