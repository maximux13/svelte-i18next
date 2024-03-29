import Backend from 'i18next-fs-backend';

import { SvelteI18next } from '$lib';

import i18n from './i18n';

const i18next = new SvelteI18next({
  i18next: {
    ...i18n,
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' }
  },
  backend: Backend
});

export default i18next;
