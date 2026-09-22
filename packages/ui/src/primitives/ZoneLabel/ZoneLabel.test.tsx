import { render, screen } from '@testing-library/react';
import { AA_NORMAL_TEXT, colors, contrast } from '@maxbid/tokens';
import { describe, expect, it } from 'vitest';
import { ZONE_LABELS, ZoneLabel } from './ZoneLabel';

describe('ZoneLabel', () => {
  it('uses the three names the token table gives, word for word', () => {
    expect(ZONE_LABELS).toEqual({
      onTarget: 'On target',
      belowTarget: 'Below target',
      lossRisk: 'Loss risk',
    });
  });

  it('always carries the label, because status is never colour alone', () => {
    for (const [zone, label] of Object.entries(ZONE_LABELS)) {
      const { unmount } = render(<ZoneLabel zone={zone as 'onTarget'} />);
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    }
  });

  it('keeps the label in the quiet tone too', () => {
    render(<ZoneLabel zone="lossRisk" tone="quiet" />);
    expect(screen.getByText('Loss risk')).toBeTruthy();
  });

  it('never uses marker yellow, which B09 reserves for the main action', () => {
    for (const zone of ['onTarget', 'belowTarget', 'lossRisk'] as const) {
      const { container, unmount } = render(<ZoneLabel zone={zone} />);
      expect(container.firstElementChild?.className).not.toContain('accent');
      unmount();
    }
  });

  it('reads at AA on every solid fill', () => {
    for (const fill of [colors.zoneGreen, colors.zoneAmber, colors.zoneRed]) {
      expect(contrast(colors.surface, fill)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    }
  });
});
