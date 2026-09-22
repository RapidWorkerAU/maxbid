// Loads the Storybook preview and the accessibility addon into every story
// test, so each story is checked by axe exactly as it is in Storybook.

import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as previewAnnotations from './.storybook/preview';

setProjectAnnotations([a11yAddonAnnotations, previewAnnotations]);
