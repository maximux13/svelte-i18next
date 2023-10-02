<script lang="ts">
  import i18next from 'i18next';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let i18n = writable(i18next);

  setContext('i18n', i18n);
</script>

<slot />
