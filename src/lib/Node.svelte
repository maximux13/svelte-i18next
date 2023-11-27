<script lang="ts">
  import type { ComponentType } from 'svelte';
  import type { ContentNode } from './types';

  export let node: ContentNode;

  function isSvelteComponent(component: any): component is ComponentType {
    return (
      (component && typeof component === 'function') ||
      (typeof component === 'object' &&
        'render' in component &&
        typeof component.render === 'function')
    );
  }
</script>

{#if node.type === 'text'}
  {node.children}
{:else if node.type === 'html'}
  <svelte:element this={node.tag} {...node.props}>
    {#each node.children as child}
      <svelte:self node={child} />
    {/each}
  </svelte:element>
{:else if node.type === 'svelte' && isSvelteComponent(node.component)}
  <svelte:component this={node.component} {...node.props}>
    {#each node.children as child}
      <svelte:self node={child} />
    {/each}
  </svelte:component>
{/if}
