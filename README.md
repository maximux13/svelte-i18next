# Svelte.i18next

![](https://img.shields.io/github/license/maximux13/svelte-i18next)
![](https://img.shields.io/npm/dm/@maximux13/svelte-i18next)
![](https://img.shields.io/npm/v/@maximux13/svelte-i18next)

## Introduction

[Svelte.i18next](https://github.com/maximux13/svelte-i18next) is a library that makes it easy to add internationalization (i18n) support to your [SvelteKit](https://kit.svelte.dev/). It provides a simple interface for configuring [i18next](https://www.i18next.com/) and managing translations.

## Installation

To install Svelte.i18next, simply run:

```bash
pnpm install @maximux13/svelte-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

## Configuration

1. Create a i18n config file at `src/i18n.ts`

```ts
export default {
  // This is the list of languages your application supports
  supportedLngs: ['en', 'es'],
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng: 'en',
  // The default namespace of i18next is "translation", but you can customize it here
  defaultNS: 'common'
};
```

2. Create the locales files at `static/locales/{lng}/{ns}.json`

```json
// e.g: static/locales/en/common.json
{
  "title": "Svelte i18next - Hello {{name}}!",
  "world": "World"
}
```

3. Create a instance of SvelteI18next at `src/i18n.server.ts`

```ts
import Backend from 'i18next-http-backend';

import { SvelteI18next } from '@maximux13/svelte-i18next';

import i18n from './i18n';

const i18next = new SvelteI18next({
  i18next: {
    ...i18n,
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' }
  },
  backend: Backend
});

export default i18next;
```

4. Create a server hook to initialize i18next at `src/hook.server.ts`

```ts
import type { Handle } from '@sveltejs/kit';
import { createInstance } from 'i18next';
import Backend from 'i18next-http-backend';

import i18n from './i18n';
import i18next from './i18n.server';

import { createFetchRequest } from '@maximux13/svelte-i18next';

export const handle: Handle = async (props) => {
  const { event, resolve } = props;

  const instance = createInstance();
  const lng = await i18next.getLocale(event);
  const ns = await i18next.getNamespaces(event);
  const request = createFetchRequest(event.fetch);

  await instance
    .use(Backend)
    .init({ ...i18n, backend: { loadPath: '/locales/{{lng}}/{{ns}}.json', request }, lng, ns });

  const initOptions = i18next.getInitOptions(instance);

  event.locals.i18n = Object.assign(instance, { initOptions });

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('<html lang="en">', `<html lang="${lng}">`)
  });
};
```

5. Create a client instance and expose that to use later on your code

`src/routes/+layout.server.ts`

```ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
  depends('i18n:lng');

  return { i18n: locals.i18n.initOptions };
};
```

`src/routes/+layout.ts`

```ts
import type { LayoutLoad } from './$types';

import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { createStore } from '@maximux13/svelte-i18next';

export const load: LayoutLoad = async ({ data }) => {
  i18next
    .use(Backend)
    .use(LanguageDetector)
    .init({
      ...data.i18n,
      detection: { caches: ['cookie'], order: ['htmlTag'] }
    });

  const store = createStore(i18next);

  return { i18n: store };
};
```

## Usage

Then you can use that store on your components

```svelte
<script lang="ts">
  export let data;

  $: ({ i18n } = data);
</script>

<h1>{$i18n.t('title', { name: $i18n.t('world') })}</h1>
```

or in your svelte server code

```ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
  depends('i18n:lng');

  return { world: locals.i18n.t('world') };
};
```

> Note: We use `depends('i18n:lng');` in order to invalidate the data when the language changes, this invalidation is call by the i18n store when calling `$i18n.changeLanguage` method.

### Managing Namespaces

To manage namespaces in Svelte.I18next, you can specify which namespaces should be loaded on each page by setting the `ns` property on the page/layout config object.

```ts
// src/routes/page.(server).ts

export const config = {
  ns: ['page']
};
```

In this example, the `page` namespace is configured to be loaded on the corresponding page. You can customize the namespaces according to your needs, and you can also use an array to load multiple namespaces on the same page.

Please note that this library also allows automatic loading of namespaces from the layout.(server).ts file of the parent routes. This provides flexibility to load additional namespaces based on the structure of your application.

## getFixedT

You can use i18next.getFixedT on your server code e.g: `+server.ts`

```ts
/** @type {import('./$types').RequestHandler} */
export function GET(event) {
  const t = i18next.getFixedT(event, { locale: 'en', namespaces: 'test', options: {} });

  return new Response(t('title'));
}
```

## Acknowledgements

This library was inspired by the work of SergioDXA on the [remix-i18next](https://github.com/sergiodxa/remix-i18next) library.

## Troubleshooting

If you run into any issues using Svelte.i18next, please check the documentation or open an issue on GitHub.

## License

This project is licensed under the MIT License.
