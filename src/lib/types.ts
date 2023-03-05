import type { i18n, InitOptions } from 'i18next';

export interface i18nLocals {
  i18n: i18n & { initOptions: Partial<InitOptions> };
}
