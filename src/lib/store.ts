import { writable } from 'svelte/store';
import type { i18n } from 'i18next';

import { invalidate } from '$app/navigation';
import { browser } from '$app/environment';

export type i18nStore = ReturnType<typeof createStore>;

export const createStore = (instance: i18n) => {
  const store = writable(instance);

  instance.on('initialized', () => {
    store.set(instance);
  });

  instance.on('loaded', () => {
    store.set(instance);
  });

  instance.on('added', () => {
    store.set(instance);
  });

  instance.on('languageChanged', () => {
    if (browser) invalidate('i18n:lng');
    else store.set(instance);
  });

  return store;
};
