import { vi } from 'vitest';
import { i18n } from './i18n';
import type { Cookies, RequestEvent } from '@sveltejs/kit';

export function createEvent({
  url,
  routeId,
  params = {},
  headers = new Headers()
}: {
  url: URL | string;
  routeId: string;
  params?: Record<string, string>;
  headers?: Headers;
}): RequestEvent {
  return {
    cookies: {
      get: vi.fn(),
      getAll: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      serialize: vi.fn()
    } as Cookies,
    fetch: fetch,
    getClientAddress: () => '',
    locals: {
      i18n: Object.assign(i18n, { initOptions: { fallbackLng: 'en' } })
    },
    isDataRequest: false,
    isSubRequest: false,
    params: params,
    platform: 'node',
    request: new Request(url, {
      headers
    }),
    route: { id: routeId || null },
    setHeaders: vi.fn(),
    url: new URL(url)
  };
}
