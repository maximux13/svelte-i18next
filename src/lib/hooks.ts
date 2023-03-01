import type { Handle } from '@sveltejs/kit';

import type SvelteI18next from './i18n';

export const createI18nServerHandler =
  (i18next: SvelteI18next): Handle =>
  async (props) => {
    const { event, resolve } = props;

    await i18next.init(event);

    // const paramKey = i18next.options.detector?.param || DEFAULT_PARAM;
    // const paramLng = event.params[paramKey];

    // if (paramLng && paramLng !== i18n.language) {
    //   const routeId = (event.route.id as string).replace(
    //     new RegExp('(\\[{1,2}(?:param)(?:=\\w+)?\\]{1,2})'.replace('param', paramKey)),
    //     i18n.language
    //   );

    //   throw redirect(302, routeId);
    // }

    return resolve(event, {
      transformPageChunk: ({ html }) =>
        html.replace('<html lang="en">', `<html lang="${event.locals.i18n.language}">`)
    });
  };
