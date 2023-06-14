import type { LayoutLoad } from './$types';

import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { createStore } from '$lib';

export const load: LayoutLoad = async ({ data }) => {
  i18next
    .use(Backend)
    .use(LanguageDetector)
    .init({
      ...data.i18n,
      detection: { caches: ['cookie'], order: ['htmlTag'] }
    });

  const store = createStore(i18next);

  return { i18n: store };
};
