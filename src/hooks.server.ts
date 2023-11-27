import { resolve } from 'node:path';

import { createInstance } from 'i18next';
import Backend from 'i18next-fs-backend';

import type { Handle } from '@sveltejs/kit';

import i18n from './i18n';
import i18next from './i18n.server';

export const handle: Handle = async (props) => {
  const { event } = props;

  const instance = createInstance();
  const lng = await i18next.getLocale(event);
  const ns = await i18next.getNamespaces(event);

  await instance.use(Backend).init({
    ...i18n,
    backend: { loadPath: resolve('./static/locales/{{lng}}/{{ns}}.json') },
    lng,
    ns
  });

  const initOptions = i18next.getInitOptions(instance);

  event.locals.i18n = Object.assign(instance, { initOptions });

  return props.resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${lng}">`)
  });
};
