import {
  createInstance,
  type InitOptions,
  type NewableModule,
  type BackendModule,
  type Namespace
} from 'i18next';

import { pick } from 'accept-language-parser';
import { parseAcceptLanguage } from 'intl-parse-accept-language';

import type { HttpBackendOptions } from 'i18next-http-backend';
import type { Cookies, RequestEvent, ServerLoadEvent } from '@sveltejs/kit';

export type LanguageDetectorOptions = {
  cookie?: string;
  param?: string;
  order?: Array<'params' | 'cookie' | 'header'>;
  supportedLngs?: InitOptions['supportedLngs'];
  fallbackLng?: InitOptions['fallbackLng'];
};

export type SvelteI18nextOptions = {
  i18next: InitOptions;
  backend?: NewableModule<BackendModule<unknown>>;
  detector?: LanguageDetectorOptions;
};

export type DetectOptions = { cookies: Cookies; params: Params; request: Request };

type Params = Partial<Record<string, string>>;
type EventLike = ServerLoadEvent | RequestEvent;

export const DEFAULT_PARAM = 'lng';
export const DEFAULT_COOKIE_NAME = 'i18next';

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

    await instance.init({
      ...initOptions,
      backend: {
        ...initOptions.backend,
        request(options, url, payload, callback) {
          event
            .fetch(url)
            .then((response) => {
              if (!response.ok)
                return callback(response.statusText || 'Error', {
                  status: response.status,
                  data: ''
                });

              response
                .text()
                .then((data) => {
                  callback(null, { status: response.status, data });
                })
                .catch((err) => callback(err, { status: 400, data: '' }));
            })
            .catch((err) => callback(err, { status: 400, data: '' }));
        }
      } as HttpBackendOptions
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

  public async getNamespaces(event: EventLike) {
    const defaultNS = this.options.i18next.defaultNS;

    if (!event.route.id) return [defaultNS];

    let ns = [];

    try {
      const { _ns } = await import('../routes/' + event.route.id + '/+page.server.ts');

      if (_ns) ns = Array.isArray(_ns) ? _ns : [_ns];
    } catch {
      //
    }

    if (Array.isArray(defaultNS)) return defaultNS.concat(ns);

    return [defaultNS].concat(ns);
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

class LanguageDetector {
  constructor(private options: LanguageDetectorOptions) {}

  public async detect(event: EventLike): Promise<string> {
    const orders = this.options.order ?? (['params', 'cookie', 'header'] as const);

    let locale: string | null = null;

    for (const order of orders) {
      if (order === 'params') {
        locale = this.fromParams(event.params);
      }

      if (order === 'cookie') {
        locale = this.fromCookie(event.cookies);
      }

      if (order === 'header') {
        locale = this.fromHeader(event.request);
      }

      if (locale) return locale;
    }

    return this.options.fallbackLng as string;
  }

  private fromParams(params: Params) {
    const param = params?.[this.options.param || DEFAULT_PARAM];
    if (!param) return null;

    return this.pick(param);
  }

  private fromCookie(cookies: Cookies) {
    const cookie = cookies.get(this.options.cookie ?? DEFAULT_COOKIE_NAME);
    if (!cookie) return null;

    return this.pick(cookie);
  }

  private fromHeader(request: Request) {
    const header = request.headers.get('Accept-Language');
    if (!header) return null;

    const locales = parseAcceptLanguage(header, {
      validate: Intl.DateTimeFormat.supportedLocalesOf,
      ignoreWildcard: true
    });

    return this.pick(locales.join(','));
  }

  private pick(lang: string | undefined) {
    const supportedLngs = Array.isArray(this.options.supportedLngs)
      ? this.options.supportedLngs
      : [this.options.supportedLngs];

    return (
      pick(supportedLngs, lang ?? (this.options.fallbackLng as string), {
        loose: false
      }) ||
      pick(supportedLngs, lang ?? (this.options.fallbackLng as string), {
        loose: true
      })
    );
  }
}
