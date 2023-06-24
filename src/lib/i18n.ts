import {
  createInstance,
  type InitOptions,
  type NewableModule,
  type BackendModule,
  type Namespace,
  type i18n
} from 'i18next';

import type { Cookies } from '@sveltejs/kit';

import createFetchRequest from './request';

import LanguageDetector, {
  type LanguageDetectorOptions,
  type Params,
  type EventLike
} from './detector';

/**
 * `SvelteI18nextOptions`
 *
 * @property {InitOptions} i18next - InitOptions
 * @property {BackendModule} - The backend module to use.
 * @property {LanguageDetectorOptions} detector - This is the language detector config.
 */
export type SvelteI18nextOptions = {
  i18next: InitOptions;
  backend?: NewableModule<BackendModule<unknown>>;
  detector?: LanguageDetectorOptions;
};

/**
 * `DetectOptions`
 *
 * @property {Cookies} cookies - The cookies that were sent with the request.
 * @property {Params} params - The parameters of the request.
 * @property {Request} request - The request object
 */
export type DetectOptions = { cookies: Cookies; params: Params; request: Request };

export default class SvelteI18next {
  private detector: LanguageDetector;

  constructor(private options: SvelteI18nextOptions) {
    this.detector = new LanguageDetector({
      ...options.detector,
      supportedLngs: options.detector?.supportedLngs ?? this.options.i18next.supportedLngs,
      fallbackLng: options.detector?.fallbackLng ?? this.options.i18next.fallbackLng
    });
  }

  private async createInstance(event: EventLike, options: InitOptions) {
    let instance = createInstance();

    const initOptions = { ...this.options.i18next, ...options };

    if (this.options.backend) instance = instance.use(this.options.backend);

    const request = createFetchRequest(event.fetch);

    await instance.init({
      ...initOptions,
      backend: {
        ...initOptions.backend,
        request
      }
    });

    return instance;
  }

  /**
   * It returns the options that will be passed to the i18next client instance
   * @param {i18n} instance - i18n - the instance of the i18n class
   */
  public getInitOptions(instance: i18n) {
    const resources = instance.store.data;
    const { backend, ...initOptions } = this.options.i18next;

    return {
      ...initOptions,
      resources,
      lng: instance.language,
      ns: instance.options.ns,
      fallbackLng: instance.store.options.fallbackLng
    };
  }

  /**
   * It returns the locale of the user following the order defined on the
   * detector order config key (`e.g: ['params', 'cookie', 'header']`) or fallback language
   * provided in the i18next config.
   *
   * @param {EventLike} event - EventLike - The event to detect the locale from.
   * @returns The locale of the user.
   */
  public async getLocale(event: EventLike) {
    return this.detector.detect(event);
  }

  /**
   * If the route has a namespace, return it, otherwise return the default namespace
   * @param {EventLike} event - EventLike - This is the event that is passed to the handler.
   * @returns An array of namespaces.
   */
  public async getNamespaces(event: EventLike): Promise<Namespace> {
    if (!event.route.id) return [];

    const ns = this.options.i18next.ns;
    const namespaces = Array.isArray(ns) ? ns : [ns];

    const route = event.route.id;
    const paths = route.split('/');
    const cwd = process.cwd();

    async function addNamespace(path: string) {
      try {
        const { config } = await import(path /* @vite-ignore */);

        if (config?.ns) {
          if (typeof config.ns === 'string') namespaces.push(config.ns);
          else namespaces.push(...config.ns);
        }
      } catch {
        // ignore
      }
    }

    await addNamespace(`${cwd}/src/routes${route}/+page`);
    await addNamespace(`${cwd}/src/routes${route}/+page.server`);

    while (paths.length > 0) {
      const route = paths.join('/');
      await addNamespace(`${cwd}/src/routes${route}/+layout`);
      await addNamespace(`${cwd}/src/routes${route}/+layout.server`);
      paths.pop();
    }

    return [...new Set(namespaces)].filter(Boolean);
  }

  /**
   * It creates an i18next instance, changes the language to the one specified in the options or the
   * one returned by the getLocale function, and returns the fixedT function
   *
   * @param {EventLike} event - The event object that was passed to the handler.
   * @param options
   * @param {string} options.locale - fixed locale string
   * @param {Namespace} options.namespace - override default namespace
   * @param {InitOptions} options.options - init options forwarded to the i18next instance
   *
   * @returns A function that returns a translation for a given key.
   */
  public async getFixedT<N extends Namespace>(
    event: EventLike,
    options: {
      locale?: string;
      namespaces?: N;
      options?: InitOptions;
    } = {}
  ) {
    const ns = options.namespaces ?? (this.options.i18next.defaultNS as string);

    const [instance, lng] = await Promise.all([
      this.createInstance(event, {
        ...this.options.i18next,
        ...options,
        ns
      }),
      options.locale ?? (await this.getLocale(event))
    ]);

    await instance.changeLanguage(lng);

    return instance.getFixedT(lng, options.namespaces);
  }
}
