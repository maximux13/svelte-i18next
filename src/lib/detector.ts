import { pick } from 'accept-language-parser';
import { parseAcceptLanguage } from 'intl-parse-accept-language';

import type { Cookies, RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import type { InitOptions } from 'i18next';

export type Params = Partial<Record<string, string>>;
export type EventLike = ServerLoadEvent | RequestEvent;

export const DEFAULT_PARAM = 'lng';
export const DEFAULT_COOKIE_NAME = 'i18next';

export type LanguageDetectorOptions = {
  cookie?: string;
  param?: string;
  order?: Array<'params' | 'cookie' | 'header'>;
  supportedLngs?: InitOptions['supportedLngs'];
  fallbackLng?: InitOptions['fallbackLng'];
};

export default class LanguageDetector {
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
