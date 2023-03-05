import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
  depends('i18n:lng');

  return { world: locals.i18n.t('world') };
};
