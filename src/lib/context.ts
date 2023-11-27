import { getContext as getSvelteContext } from 'svelte';

import { error } from '$lib/utils/misc';

import type { i18n } from 'i18next';
import type { Writable } from 'svelte/store';

export default function getContext() {
  const context = getSvelteContext('i18n') as Writable<i18n>;

  if (!context) {
    error('No context found. Are you using the component outside of a <SvelteI18nProvider>?');
  }

  return context;
}
