import { describe, expect, test, vi } from 'vitest';

import { SvelteI18next } from '$lib';
import { createEvent } from './createEvent';

process.cwd = vi.fn().mockReturnValue('/Mock/');

class TestSvelteI18next extends SvelteI18next {
  protected async resolveRoute(path: string) {
    const routes = {
      '/Mock/src/routes/+page': { config: { ns: 'rootPageNS' } },
      '/Mock/src/routes/+page.server': { config: { ns: 'rootPageServerNS' } },
      '/Mock/src/routes/+layout': { config: { ns: 'rootLayoutNS' } },
      '/Mock/src/routes/+layout.server': { config: { ns: 'rootLayoutServerNS' } },
      '/Mock/src/routes/a/+page': { config: { ns: 'aPageNS' } },
      '/Mock/src/routes/a/+layout': { config: { ns: 'aLayoutNS' } },
      '/Mock/src/routes/a/b/+page.server': { config: { ns: 'abPageServerNS' } },
      '/Mock/src/routes/a/b/c/+layout.server': { config: { ns: 'abcLayoutServerNS' } },
      '/Mock/src/routes/(A)/+layout': { config: { ns: '(A)aaLayoutNS' } },
      '/Mock/src/routes/(A)/aa/+page.server': { config: { ns: '(A)aaPageServerNS' } },
      '/Mock/src/routes/(A)/(B)/bb/+page.server': { config: { ns: '(A)(B)bbPageServerNS' } }
    };

    return routes[path as keyof typeof routes] || {};
  }
}

describe('SvelteI18next', () => {
  const instance = new TestSvelteI18next({
    i18next: {
      defaultNS: 'translation',
      supportedLngs: ['en', 'es'],
      resources: {
        en: {
          translation: {
            key: 'key'
          }
        },
        es: {
          translation: {
            key: 'Schlüssel'
          }
        }
      }
    }
  });

  test('should be defined', () => {
    expect(SvelteI18next).toBeDefined();
  });

  test.each`
    routeId          | expected
    ${'/'}           | ${['translation', 'rootPageNS', 'rootPageServerNS', 'rootLayoutNS', 'rootLayoutServerNS']}
    ${'/a'}          | ${['translation', 'aPageNS', 'aLayoutNS', 'rootLayoutNS', 'rootLayoutServerNS']}
    ${'/a/b'}        | ${['translation', 'abPageServerNS', 'aLayoutNS', 'rootLayoutNS', 'rootLayoutServerNS']}
    ${'/a/b/c'}      | ${['translation', 'abcLayoutServerNS', 'aLayoutNS', 'rootLayoutNS', 'rootLayoutServerNS']}
    ${'/(A)/aa'}     | ${['translation', '(A)aaPageServerNS', '(A)aaLayoutNS', 'rootLayoutNS', 'rootLayoutServerNS']}
    ${'/(A)/(B)/bb'} | ${['translation', '(A)(B)bbPageServerNS', '(A)aaLayoutNS', 'rootLayoutNS', 'rootLayoutServerNS']}
  `('should provide a the right namespaces for $routeId', async ({ routeId, expected }) => {
    const event = createEvent({
      url: 'http://localhost:3000/' + routeId,
      routeId
    });

    const ns = await instance.getNamespaces(event);

    expect(ns).toEqual(expected);
  });

  test('should provide a fixedT function', async () => {
    const event = createEvent({
      url: 'http://localhost:3000/',
      routeId: '/'
    });

    const fixedT = await instance.getFixedT(event);

    expect(fixedT).toBeDefined();
    expect(fixedT('key')).toEqual('key');
  });

  test('should provide a fixedT function with a custom namespace', async () => {
    const event = createEvent({
      url: 'http://localhost:3000/',
      routeId: '/'
    });

    const fixedT = await instance.getFixedT(event, { namespaces: ['a', 'b'] });

    expect(fixedT).toBeDefined();
    expect(fixedT('key')).toEqual('key');
    expect('ns' in fixedT && fixedT['ns']).toEqual(['a', 'b']);
  });

  test('should provide a fixedT function with a custom locale', async () => {
    const event = createEvent({
      url: 'http://localhost:3000/',
      routeId: '/'
    });

    const fixedT = await instance.getFixedT(event, { locale: 'es' });

    expect(fixedT).toBeDefined();
    expect(fixedT('key')).toEqual('Schlüssel');
    expect('lng' in fixedT && fixedT['lng']).toEqual('es');
  });

  test('should provide a fixedT function with a custom options', async () => {
    const event = createEvent({
      url: 'http://localhost:3000/',
      routeId: '/'
    });

    const fixedT = await instance.getFixedT(event, {
      locale: 'fr',
      options: { fallbackLng: 'en' }
    });

    expect(fixedT).toBeDefined();
    expect(fixedT('key')).toEqual('key');
  });

  test('should detect the locale from the event', async () => {
    const event = createEvent({
      url: 'http://localhost:3000/',
      routeId: '/',
      headers: new Headers({
        'accept-language': 'es'
      })
    });

    const locale = await instance.getLocale(event);

    expect(locale).toEqual('es');

    const event2 = createEvent({
      url: 'http://localhost:3000/',
      routeId: '/',
      params: {
        lng: 'es'
      }
    });

    const locale2 = await instance.getLocale(event2);

    expect(locale2).toEqual('es');

    const event3 = createEvent({
      url: 'http://localhost:3000/',
      routeId: '/'
    });

    event3.cookies.get = vi.fn((name: string) => {
      if (name === 'i18next') return 'es';
      return undefined;
    });

    const locale3 = await instance.getLocale(event3);

    expect(locale3).toEqual('es');
  });
});
