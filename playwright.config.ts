import { defineConfig } from '@playwright/test';

// Test viewports from workbook tab 39, rule MF02.
const viewports = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-15', width: 393, height: 852 },
  { name: 'pixel', width: 412, height: 915 },
  { name: 'ipad', width: 820, height: 1180 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'desktop-wide', width: 1440, height: 900 },
];

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000' },
  projects: viewports.map((v) => ({ name: v.name, use: { viewport: { width: v.width, height: v.height } } })),
});
