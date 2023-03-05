<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import i18next from 'i18next';
  import Backend from 'i18next-http-backend';
  import LanguageDetector from 'i18next-browser-languagedetector';

  import { createStore } from '@maximux13/svelte-i18next';

  import type { LayoutData } from './$types';

  export let data: LayoutData;

  const store = createStore(i18next);

  i18next
    .use(Backend)
    .use(LanguageDetector)
    .init({
      ...data.i18n,
      detection: { caches: ['cookie'], order: ['htmlTag'] }
    });

  setContext('i18n', store);
</script>

<slot />
