// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// See https://kit.svelte.dev/docs/types#app

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      i18n: import('$lib').i18nLocals['i18n'];
    }
    // interface PageData {}
    // interface Platform {}
    // interface Locals  {}
  }
}

export {};
