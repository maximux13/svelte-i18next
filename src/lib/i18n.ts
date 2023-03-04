import {
  createInstance,
  type InitOptions,
  type NewableModule,
  type BackendModule,
  type Namespace
} from 'i18next';

import type { Cookies, ServerLoadEvent } from '@sveltejs/kit';

import createFetchRequest from './request';

import LanguageDetector, {
  type LanguageDetectorOptions,
  type Params,
  type EventLike
} from './detector';

export type SvelteI18nextOptions = {
  i18next: InitOptions;
  backend?: NewableModule<BackendModule<unknown>>;
  detector?: LanguageDetectorOptions;
  routes?: Record<string, Namespace>;
};

export type DetectOptions = { cookies: Cookies; params: Params; request: Request };

export default class SvelteI18next {
  private detector: LanguageDetector;

  constructor(public options: SvelteI18nextOptions) {
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

  public async init(event: EventLike) {
    const locals = event.locals;

    const lng = await this.getLocale(event);
    const ns = await this.getNamespaces(event);

    const [instance] = await Promise.all([
      this.createInstance(event as ServerLoadEvent, {
        ...this.options.i18next,
        lng,
        fallbackLng: lng,
        ns
      })
    ]);

    await instance.changeLanguage(lng);

    const resources = instance.store.data;
    const { backend, ...initOptions } = this.options.i18next;

    locals.i18n = Object.assign(instance, {
      initOptions: {
        ...initOptions,
        resources,
        lng,
        ns,
        fallbackLng: lng
      }
    });

    return locals.i18n;
  }

  public async getLocale(event: EventLike) {
    return this.detector.detect(event);
  }

  public getNamespaces(event: EventLike) {
    const defaultNS = this.options.i18next?.defaultNS || 'translation';

    if (!event.route.id) return defaultNS as Namespace;

    let ns;

    if ((ns = this.options.routes?.[event.route.id])) {
      return [...new Set([defaultNS].concat(ns))] as Namespace;
    }

    return defaultNS as Namespace;
  }

  public async getFixedT<N extends Namespace>(
    event: ServerLoadEvent,
    locale: string,
    namespaces?: N,
    options?: InitOptions
  ) {
    const [instance] = await Promise.all([
      this.createInstance(event, {
        ...this.options.i18next,
        ...options
      })
    ]);

    await instance.changeLanguage(locale);
    await instance.loadNamespaces(namespaces ?? 'translations');

    return instance.getFixedT(locale, namespaces);
  }
}
