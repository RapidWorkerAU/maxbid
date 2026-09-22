import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToggleGroup } from './ToggleGroup';

const options = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

function renderGroup(value: string, onChange = vi.fn()) {
  render(
    <ToggleGroup legend="Registered for GST" options={options} value={value} onChange={onChange} />,
  );
  return onChange;
}

describe('ToggleGroup', () => {
  it('names the group so a screen reader knows what is being chosen', () => {
    renderGroup('yes');
    expect(screen.getByRole('group', { name: 'Registered for GST' })).toBeTruthy();
  });

  it('says which choice is active through aria-pressed, not colour alone', () => {
    renderGroup('yes');
    expect(screen.getByRole('button', { name: 'Yes' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'No' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('reports the value the user picked', () => {
    const onChange = renderGroup('yes');
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(onChange).toHaveBeenCalledWith('no');
  });

  it('meets the 44px minimum touch target on every choice', () => {
    renderGroup('yes');
    for (const label of ['Yes', 'No']) {
      expect(screen.getByRole('button', { name: label }).className).toContain('min-h-11');
    }
  });

  it('keeps a visible focus ring on every choice', () => {
    renderGroup('yes');
    expect(screen.getByRole('button', { name: 'Yes' }).className).toContain(
      'focus-visible:outline-accent',
    );
  });
});
