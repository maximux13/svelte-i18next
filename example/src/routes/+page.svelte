<script lang="ts">
  export let data;

  $:({ i18n, world } = data)
</script>

<svelte:head>
  <title>{$i18n.t('title', { name: world })}</title>
</svelte:head>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<pre>{$i18n.t('title', { name: world })}</pre>

<button on:click={() => $i18n.changeLanguage('es')}>ES</button>
<button on:click={() => $i18n.changeLanguage('en')}>EN</button>
