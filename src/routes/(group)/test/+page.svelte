<script lang="ts">
  import type { i18nStore } from '$lib/store';
  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  const i18n = getContext('i18n') as i18nStore;
</script>

<svelte:head>
  <title>{$page.data.title}</title>
</svelte:head>

{$i18n.t('key')}

{#if $i18n.language == 'es'}
  {$i18n.t('test:other', { value: '1' })}
{:else}
  {$i18n.t('test:other', { value: '2' })}
{/if}

<button on:click={() => $i18n.changeLanguage('es')}>ES</button>
<button on:click={() => $i18n.changeLanguage('en')}>EN</button>
