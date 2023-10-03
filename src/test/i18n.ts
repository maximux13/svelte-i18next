import { createStore } from '$lib/store';
import { createInstance } from 'i18next';

export const i18n = createInstance();

i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        // Simple text
        simple_text: 'Simple text',
        // Interpolation
        interpolation: 'Hello {{name}}',
        // Interpolation with function
        interpolation_function: 'Hello {{name, uppercase}}',
        // Numeric tag
        numeric_tag: 'Hello <0>world</0>',
        // Named tag
        named_tag: 'Hello <a>world</a>',
        // Numeric tag found twice in the same sentence
        numeric_tag_twice: 'Hello <0>world</0> and <0>universe</0>',
        // Named tag found twice in the same sentence
        named_tag_twice: 'Hello <a>world</a> and <a>universe</a>',
        // Nested tags
        nested_tags: 'This is <0>bold <1>and italic</1></0>',
        // Svelte component
        svelte_component: 'This is a <0>svelte component</0>',
        // Interpolation with tag
        interpolation_with_tag: 'Hello <0>{{name}}</0>',
        // Interpolation with nested tags
        interpolation_with_nested_tags: 'Hello <0><1>{{name}}</1></0>',
        // Interpolation with svelte component
        interpolation_with_svelte_component: 'Hello <0><1>{{name}}</1></0>',
        // Interpolation with svelte component and nested tags
        interpolation_with_svelte_component_and_nested_tags: 'Hello <0><1>{{name}}</1></0>',
        // Translation with context
        greeting_male: 'Hello Mr. {{name}}',
        greeting_female: 'Hello Mrs. {{name}}',
        // Translation with pluralization
        count_one: 'You have {{count}} message',
        count_other: 'You have {{count}} messages',
        // Missing tag
        missing_tag: 'Hello <0>world</0>',
        // Array of elements
        array_elements: ['Hello', 'world']
      },
      other: {
        simple_text: 'Simple text (other)'
      }
    },
    es: {
      translation: {
        simple_text: 'Texto simple'
      }
    }
  },
  interpolation: {
    escapeValue: false, // not needed for react!!
    format(value, format) {
      if (format === 'uppercase') return value.toUpperCase();
      return value;
    }
  }
});

export const store = createStore(i18n);
