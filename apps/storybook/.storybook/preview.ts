import type { Preview } from '@storybook/react-vite';
import './storybook.css';

// MF02 test viewports. Every component is authored for 360px first and
// reviewed at 375px before 1440px, per AGENTS.md rule 10.
export const VIEWPORTS = {
  base360: { name: '360 base width', styles: { width: '360px', height: '780px' } },
  mobile375: { name: '375 iPhone SE', styles: { width: '375px', height: '812px' } },
  mobile393: { name: '393 iPhone 15', styles: { width: '393px', height: '852px' } },
  tablet820: { name: '820 iPad', styles: { width: '820px', height: '1180px' } },
  desktop1440: { name: '1440 desktop', styles: { width: '1440px', height: '900px' } },
};

const preview: Preview = {
  parameters: {
    layout: 'centered',
    a11y: { test: 'error' },
    viewport: { options: VIEWPORTS },
  },
};

export default preview;
