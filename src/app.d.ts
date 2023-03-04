// See https://kit.svelte.dev/docs/types#app

import type { i18n, InitOptions, Namespace } from 'i18next';

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
    interface Locals {
      i18n: i18n & { initOptions: Partial<InitOptions> };
      ns: Namespace;
    }
  }
}

export {};
