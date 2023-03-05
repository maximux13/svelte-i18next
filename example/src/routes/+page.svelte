<script lang="ts">
  import type { i18nStore } from '@maximux13/svelte-i18next';
  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  const i18n = getContext('i18n') as i18nStore;
</script>

<svelte:head>
  <title>{$i18n.t('title', { name: $page.data.world })}</title>
</svelte:head>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<pre>{$i18n.t('title', { name: $page.data.world })}</pre>

<button on:click={() => $i18n.changeLanguage('es')}>ES</button>
<button on:click={() => $i18n.changeLanguage('en')}>EN</button>
