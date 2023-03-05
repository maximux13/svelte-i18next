// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// See https://kit.svelte.dev/docs/types#app

import type { i18nLocals } from '@maximux13/svelte-i18next';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Locals extends i18nLocals {}
  }
}

export {};
