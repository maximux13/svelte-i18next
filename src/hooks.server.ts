import i18next from './i18n.server';

import { createI18nServerHandler } from '$lib';

const handler = createI18nServerHandler(i18next);

export const handle = handler;
