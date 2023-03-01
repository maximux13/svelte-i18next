import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
  depends('i18n:lng');

  return { title: locals.i18n.t('key'), ns: ['test'] };
};

export const _ns = ['test'];
