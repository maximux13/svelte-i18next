import { describe, expect, test, vi } from 'vitest';

import LanguageDetector from '$lib/detector';

import { createEvent } from './createEvent';

describe('detector', () => {
  test('should exits', () => {
    expect(LanguageDetector).toBeDefined();
  });

  const detector = new LanguageDetector({
    cookie: 'i18next',
    param: 'lng',
    order: ['params', 'cookie', 'header'],
    supportedLngs: ['en', 'es'],
    fallbackLng: 'en'
  });

  test('should detect language from params', async () => {
    const event = createEvent({
      url: 'http://localhost:3000',
      routeId: 'index',
      params: { lng: 'es' }
    });

    const result = await detector.detect(event);

    expect(result).toBe('es');
  });

  test('should detect language from cookie', async () => {
    const event = createEvent({
      url: 'http://localhost:3000',
      routeId: 'index'
    });

    event.cookies.get = vi.fn().mockReturnValue('es');

    const result = await detector.detect(event);

    expect(result).toBe('es');
  });

  test('should detect language from header', async () => {
    const event = createEvent({
      url: 'http://localhost:3000',
      routeId: 'index',
      headers: new Headers({ 'accept-language': 'es-CO' })
    });

    const result = await detector.detect(event);

    expect(result).toBe('es');
  });

  test('should detect language based on order', async () => {
    const event = createEvent({
      url: 'http://localhost:3000',
      routeId: 'index',
      params: { lng: 'en' },
      headers: new Headers({ 'accept-language': 'es' })
    });

    event.cookies.get = vi.fn().mockReturnValue('fr');

    const headerFirst = new LanguageDetector({
      cookie: 'i18next',
      param: 'lng',
      order: ['header', 'cookie', 'params'],
      supportedLngs: ['en', 'es', 'fr'],
      fallbackLng: 'en'
    });

    const result = await headerFirst.detect(event);

    expect(result).toBe('es');

    const cookieFirst = new LanguageDetector({
      cookie: 'i18next',
      param: 'lng',
      order: ['cookie', 'header', 'params'],
      supportedLngs: ['en', 'es', 'fr'],
      fallbackLng: 'en'
    });

    const result2 = await cookieFirst.detect(event);

    expect(result2).toBe('fr');

    const paramsFirst = new LanguageDetector({
      cookie: 'i18next',
      param: 'lng',
      order: ['params', 'header', 'cookie'],
      supportedLngs: ['en', 'es', 'fr'],
      fallbackLng: 'en'
    });

    const result3 = await paramsFirst.detect(event);

    expect(result3).toBe('en');
  });

  test('should detect language from header with multiple languages', async () => {
    const event = createEvent({
      url: 'http://localhost:3000',
      routeId: 'index',
      headers: new Headers({ 'accept-language': 'es-CO, en-US' })
    });

    const result = await detector.detect(event);

    expect(result).toBe('es');
  });

  test('should detect language from header with multiple languages and unsupported language', async () => {
    const event = createEvent({
      url: 'http://localhost:3000',
      routeId: 'index',
      headers: new Headers({ 'accept-language': 'fr, en-US' })
    });

    const result = await detector.detect(event);

    expect(result).toBe('en');
  });

  test('should fallback to default language if no language is detected', async () => {
    const event = createEvent({
      url: 'http://localhost:3000',
      routeId: 'index'
    });

    const result = await detector.detect(event);

    expect(result).toBe('en');
  });

  test('should fallback to default language if detected language is not supported', async () => {
    const event = createEvent({
      url: 'http://localhost:3000',
      routeId: 'index',
      headers: new Headers({ 'accept-language': 'fr' })
    });

    const result = await detector.detect(event);

    expect(result).toBe('en');
  });

  test('should fallback to default language if detected language is not supported and multiple languages are sent', async () => {
    const event = createEvent({
      url: 'http://localhost:3000',
      routeId: 'index',
      headers: new Headers({ 'accept-language': 'fr, zh' })
    });

    const result = await detector.detect(event);

    expect(result).toBe('en');
  });
});
