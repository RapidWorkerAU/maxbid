// Serves the component register to Storybook as a virtual module, so the
// overview page reads the register itself rather than a copy of it.

import { readRegister, REGISTER_PATH } from './component-register.mjs';

const ID = 'virtual:component-register';
const RESOLVED = '\0' + ID;

export function componentRegisterPlugin() {
  return {
    name: 'maxbid-component-register',
    resolveId(id) {
      return id === ID ? RESOLVED : null;
    },
    load(id) {
      if (id !== RESOLVED) return null;
      this.addWatchFile?.(REGISTER_PATH);
      return `export default ${JSON.stringify(readRegister())};`;
    },
  };
}

export default componentRegisterPlugin;
