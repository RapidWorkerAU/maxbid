import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { componentRegisterPlugin } from '../../../scripts/register-vite-plugin.mjs';

const config: StorybookConfig = {
  stories: [
    '../../../packages/ui/src/**/*.stories.@(ts|tsx)',
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  async viteFinal(viteConfig) {
    viteConfig.plugins = [
      ...(viteConfig.plugins ?? []),
      tailwindcss(),
      componentRegisterPlugin(),
    ];
    return viteConfig;
  },
};

export default config;
