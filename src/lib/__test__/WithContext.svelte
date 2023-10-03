<script>
  import { store } from './i18n';
  import Provider from '$lib/provider.svelte';
  import Trans from '$lib/Trans.svelte';
</script>

<Provider i18n={store}>
  <Trans {...$$props} />
</Provider>
