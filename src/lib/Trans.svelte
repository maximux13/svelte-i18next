<script lang="ts">
  import Node from './Node.svelte';
  import parseContent from './utils/parse';
  import getContext from './context';

  import type { Writable } from 'svelte/store';
  import type { Namespace, TOptions, i18n } from 'i18next';
  import type { ComponentMap } from './types';

  /**
   * @type {string} key - The i18n key to translate
   */
  export let key: string = '';
  /**
   * @type {ComponentMap} components - A map of components to replace
   */
  export let components: ComponentMap = [];
  /**
   * @type {Record<string, any>} values - The values to interpolate
   */
  export let values: Record<string, any> = {};
  /**
   * @type {number} count - The count to interpolate
   */
  export let count: number | undefined = undefined;
  /**
   * @type {string} parent - The parent element to render
   */
  export let parent: string = 'div';
  /**
   * @type {string} context - The context to interpolate
   */
  export let context: string = '';
  /**
   * @type {TOptions} tOptions - The options to pass to i18next
   */
  export let tOptions: TOptions = {};
  /**
   * @type {string | undefined} defaultValue - The default value to use
   */
  export let defaultValue: string | undefined = undefined;
  /**
   * @type {Namespace} ns - The namespace to use
   */
  export let ns: Namespace | undefined = undefined;
  /**
   * @type {i18n} instance - The i18next instance to use
   */
  export let i18n: Writable<i18n> | undefined = undefined;
  /**
   * @type {i18n['t']} i18nT - The i18next t function to use
   */
  export let t: i18n['t'] | undefined = undefined;

  $: instance = i18n || getContext();

  $: i18nT = t || $instance.t.bind($instance);

  $: namespace =
    ns || ('ns' in i18nT && i18nT['ns']) || ($instance.options && $instance.options.defaultNS);

  $: options = {
    ...tOptions,
    ...values,
    count,
    context,
    defaultValue,
    ns: (typeof namespace === 'string' ? [namespace] : namespace) as Namespace
  };

  $: content = i18nT(key, options);

  $: parsedContent = parseContent(content, components);
</script>

<svelte:element this={parent}>
  {#each parsedContent as node (node.children)}
    <Node {node} />
  {/each}
</svelte:element>
