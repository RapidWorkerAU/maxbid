import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TitleBlock } from './TitleBlock';

const entries = [
  { label: 'Project', value: 'MaxBid' },
  { label: 'Sheet', value: '01' },
];

describe('TitleBlock', () => {
  it('reads as a set of label and value pairs', () => {
    const { container } = render(<TitleBlock entries={entries} />);
    expect(container.querySelector('dl')).toBeTruthy();
    expect(container.querySelectorAll('dt')).toHaveLength(2);
    expect(container.querySelectorAll('dd')).toHaveLength(2);
  });

  it('shows every label and value', () => {
    render(<TitleBlock entries={entries} />);
    for (const entry of entries) {
      expect(screen.getByText(entry.label)).toBeTruthy();
      expect(screen.getByText(entry.value)).toBeTruthy();
    }
  });

  it('carries a name, so a screen reader knows what the block is', () => {
    render(<TitleBlock entries={entries} />);
    expect(screen.getByLabelText('Sheet details')).toBeTruthy();
  });

  it('takes a caption when the default does not fit', () => {
    render(<TitleBlock entries={entries} caption="Drawing title block" />);
    expect(screen.getByLabelText('Drawing title block')).toBeTruthy();
  });
});
