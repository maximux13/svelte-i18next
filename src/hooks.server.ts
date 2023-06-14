import type { Handle } from '@sveltejs/kit';
import { createInstance } from 'i18next';
import Backend from 'i18next-http-backend';

import i18n from './i18n';
import i18next from './i18n.server';

import { createFetchRequest } from '$lib';

export const handle: Handle = async (props) => {
  const { event, resolve } = props;

  const instance = createInstance();
  const lng = await i18next.getLocale(event);
  const ns = await i18next.getNamespaces(event);
  const request = createFetchRequest(event.fetch);

  await instance
    .use(Backend)
    .init({ ...i18n, backend: { loadPath: '/locales/{{lng}}/{{ns}}.json', request }, lng, ns });

  const initOptions = i18next.getInitOptions(instance);

  event.locals.i18n = Object.assign(instance, { initOptions });

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${lng}">`)
  });
};
