import { render, screen } from '@testing-library/react';
import { AA_NORMAL_TEXT, colors, contrast } from '@maxbid/tokens';
import { describe, expect, it } from 'vitest';
import { PROVENANCE_LABELS, ProvenanceTag } from './ProvenanceTag';

describe('ProvenanceTag', () => {
  it('carries a text label, so colour is never the only signal', () => {
    for (const [provenance, label] of Object.entries(PROVENANCE_LABELS)) {
      const { unmount } = render(<ProvenanceTag provenance={provenance as 'verified'} />);
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    }
  });

  it('uses the four names from the transparency spec, word for word', () => {
    expect(PROVENANCE_LABELS).toEqual({
      verified: 'Verified',
      extracted: 'Extracted',
      estimated: 'Estimated',
      yourInput: 'Your input',
    });
  });

  it('reads at AA on every tag fill', () => {
    const pairs = [
      [colors.surface, colors.tagVerified],
      [colors.ink, colors.tagExtracted],
      [colors.ink, colors.tagEstimated],
      [colors.surface, colors.tagYourInput],
    ] as const;
    for (const [text, fill] of pairs) {
      expect(contrast(text, fill)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });
});
