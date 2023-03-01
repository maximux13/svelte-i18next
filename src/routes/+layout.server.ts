import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
  depends('i18n:lng');

  return { i18n: locals.i18n.initOptions };
};

export const _ns = ['yolo'];
