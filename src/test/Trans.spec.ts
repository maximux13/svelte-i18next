import { describe, test, expect, vi } from 'vitest';
import { act, render } from '@testing-library/svelte';
import { createInstance } from 'i18next';

import Trans from '$lib/Trans.svelte';
import TransWithContext from './WithContext.svelte';
import Link from './Link.svelte';
import { store } from './i18n';
import { createStore } from '$lib/store';

describe('<Trans />', () => {
  test.each`
    key                                                      | props                                                         | expected
    ${'simple_text'}                                         | ${{}}                                                         | ${'Simple text'}
    ${'interpolation'}                                       | ${{ values: { name: 'John' } }}                               | ${'Hello John'}
    ${'interpolation_function'}                              | ${{ values: { name: 'John' } }}                               | ${'Hello JOHN'}
    ${'numeric_tag'}                                         | ${{ components: ['strong'] }}                                 | ${'Hello world'}
    ${'named_tag'}                                           | ${{ components: { a: 'strong' } }}                            | ${'Hello world'}
    ${'numeric_tag_twice'}                                   | ${{ components: ['strong'] }}                                 | ${'Hello world and universe'}
    ${'named_tag_twice'}                                     | ${{ components: { a: 'strong' } }}                            | ${'Hello world and universe'}
    ${'nested_tags'}                                         | ${{ components: ['strong', 'i'] }}                            | ${'This is bold and italic'}
    ${'svelte_component'}                                    | ${{ components: [Link] }}                                     | ${'This is a svelte component'}
    ${'interpolation_with_tag'}                              | ${{ values: { name: 'John' }, components: ['strong'] }}       | ${'Hello John'}
    ${'interpolation_with_nested_tags'}                      | ${{ values: { name: 'John' }, components: ['strong', 'i'] }}  | ${'Hello John'}
    ${'interpolation_with_svelte_component'}                 | ${{ values: { name: 'John' }, components: [Link, 'strong'] }} | ${'Hello John'}
    ${'interpolation_with_svelte_component_and_nested_tags'} | ${{ values: { name: 'John' }, components: [Link, 'strong'] }} | ${'Hello John'}
    ${'greeting'}                                            | ${{ values: { name: 'John' }, context: 'male' }}              | ${'Hello Mr. John'}
    ${'greeting'}                                            | ${{ values: { name: 'Jane' }, context: 'female' }}            | ${'Hello Mrs. Jane'}
    ${'count'}                                               | ${{ count: 1 }}                                               | ${'You have 1 message'}
    ${'count'}                                               | ${{ count: 2 }}                                               | ${'You have 2 messages'}
    ${'array_elements'}                                      | ${{ tOptions: { joinArrays: ' ' } }}                          | ${'Hello world'}
  `('should render "$key" key', async ({ key, props, expected }) => {
    const { container } = render(Trans, { props: { i18n: store, key, ...props } });

    expect(container.textContent).toBe(expected);
  });

  test('should render html component', async () => {
    render(Trans, { props: { i18n: store, key: 'numeric_tag', components: ['strong'] } });

    expect(document.querySelector('strong')).toBeInTheDocument();
    expect(document.querySelector('strong')).toHaveTextContent('world');
  });

  test('should render svelte component', async () => {
    render(Trans, { props: { i18n: store, key: 'numeric_tag', components: [Link] } });

    expect(document.querySelector('a')).toBeInTheDocument();
    expect(document.querySelector('a')).toHaveTextContent('world');
  });

  test('should pass down props to component', async () => {
    render(Trans, {
      props: {
        i18n: store,
        key: 'nested_tags',
        components: [
          { component: 'strong', props: { class: 'bold' } },
          { component: Link, props: { href: 'https://example.com' } }
        ]
      }
    });

    expect(document.querySelector('strong')).toBeInTheDocument();
    expect(document.querySelector('strong')).toHaveClass('bold');
    expect(document.querySelector('a')).toBeInTheDocument();
    expect(document.querySelector('a')).toHaveAttribute('href', 'https://example.com');
  });

  test('should render named tag', async () => {
    render(Trans, {
      props: {
        i18n: store,
        defaultValue: 'Hello <a>world</a> and <b>universe</b>',
        components: {
          a: { component: 'strong', props: { class: 'bold' } },
          b: { component: 'i', props: { class: 'italic' } }
        }
      }
    });

    expect(document.querySelector('strong')).toBeInTheDocument();
    expect(document.querySelector('strong')).toHaveClass('bold');
    expect(document.querySelector('i')).toBeInTheDocument();
    expect(document.querySelector('i')).toHaveClass('italic');
  });

  test('should warn when missing tag', async () => {
    window.console.warn = vi.fn();

    render(Trans, {
      props: {
        i18n: store,
        key: 'missing_tag'
      }
    });

    expect(window.console.warn).toHaveBeenCalled();
    expect(window.console.warn).toHaveBeenCalledWith(
      'svelte-i18next:: No component found for tag <0>.'
    );
  });

  test('should render key from other namespace', async () => {
    render(Trans, {
      props: {
        i18n: store,
        key: 'simple_text',
        ns: 'other'
      }
    });

    expect(document.body).toHaveTextContent('Simple text (other)');
  });

  test('should render key from other language', async () => {
    render(Trans, {
      props: {
        i18n: store,
        key: 'simple_text',
        tOptions: {
          lng: 'es'
        }
      }
    });

    expect(document.body).toHaveTextContent('Texto simple');
  });

  test('should allow to override t function', async () => {
    const instance = createInstance();
    instance.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {
        en: {
          translation: {
            simple_text: 'Simple text with custom t function'
          }
        }
      }
    });

    render(Trans, {
      props: {
        i18n: store,
        key: 'simple_text',
        t: instance.t.bind(instance)
      }
    });

    expect(document.body).toHaveTextContent('Simple text with custom t function');
  });

  test('should use default value when key is missing', async () => {
    render(Trans, {
      props: {
        i18n: store,
        key: 'missing_key',
        defaultValue: 'Default value'
      }
    });

    expect(document.body).toHaveTextContent('Default value');
  });

  test('should use i18n instance from context', async () => {
    render(TransWithContext, {
      props: {
        key: 'simple_text'
      }
    });

    expect(document.body).toHaveTextContent('Simple text');
  });

  test('should update content when i18n instance changes', async () => {
    const instance = createInstance();

    instance.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {
        en: {
          translation: {
            simple_text: 'Simple text'
          }
        },
        es: {
          translation: {
            simple_text: 'Texto simple'
          }
        }
      }
    });

    render(Trans, {
      props: {
        i18n: createStore(instance),
        key: 'simple_text'
      }
    });

    expect(document.body).toHaveTextContent('Simple text');

    await act(() => {
      instance.changeLanguage('es');
    });

    expect(document.body).toHaveTextContent('Texto simple');
  });
});
