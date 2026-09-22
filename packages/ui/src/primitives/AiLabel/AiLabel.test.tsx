import { render, screen } from '@testing-library/react';
import { DS33 } from '@maxbid/content';
import { describe, expect, it } from 'vitest';
import { AiLabel } from './AiLabel';

describe('AiLabel', () => {
  it('says AI generated in words', () => {
    render(<AiLabel />);
    expect(screen.getByText('AI generated')).toBeTruthy();
  });

  it('shows the reason from packages/content when one is given', () => {
    render(<AiLabel detail={DS33} />);
    expect(screen.getByText(DS33)).toBeTruthy();
  });

  it('renders nothing beyond the marker when there is no detail', () => {
    const { container } = render(<AiLabel />);
    expect(container.textContent).toBe('AI generated');
  });
});
