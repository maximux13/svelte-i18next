import { writable, type Writable } from 'svelte/store';
import type { i18n } from 'i18next';

import { invalidate } from '$app/navigation';

export type i18nStore = ReturnType<typeof createStore>;

let store: Writable<i18n>;

export const createStore = (instance: i18n) => {
  if (store) return store;

  store = writable(instance);
  let currentLanguage = instance.language;

  instance.on('initialized', () => {
    store.set(instance);
  });

  instance.on('loaded', () => {
    store.set(instance);
  });

  instance.on('added', () => {
    store.set(instance);
  });

  instance.on('languageChanged', (lng) => {
    if (lng === currentLanguage) return;
    currentLanguage = lng;

    instance.reloadResources([lng]).then(() => {
      if (typeof document !== 'undefined') {
        invalidate('i18n:lng');
        document.documentElement.lang = lng;
      }

      store.set(instance);
    });
  });

  return store;
};
