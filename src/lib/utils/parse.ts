import { warn } from './misc';

import type { ComponentMap, ContentNode } from '$lib/types';
import type { ComponentType } from 'svelte';

const isArrayComponentMap = (components: ComponentMap): components is ComponentType[] =>
  Array.isArray(components);

const isObjectComponentMap = (
  components: ComponentMap
): components is Record<string, ComponentType> => typeof components === 'object';

const isComponentWithProps = (
  component: ComponentType | { component: ComponentType; props?: any }
): component is { component: ComponentType; props: any } =>
  typeof component === 'object' && 'component' in component;

export function text(text: string): Extract<ContentNode, { type: 'text' }> {
  return { type: 'text', children: text };
}

export function html(
  tag: string,
  children: ContentNode[] = [],
  props: Record<string, unknown> = {}
): Extract<ContentNode, { type: 'html' }> {
  return { type: 'html', tag, children, props };
}

export function svelte(
  component: any,
  children: ContentNode[] = [],
  props: Record<string, unknown> = {}
): Extract<ContentNode, { type: 'svelte' }> {
  return { type: 'svelte', component, children, props };
}

/**
 * Parses the given translation content to produce a structured representation of it.
 *
 * @param {string} content - The translation string with embedded tags.
 * @param {Array|string} components - An array or object of components or HTML tags to interpolate.
 * @returns {Array} A structured array representation of the content with its components.
 */
function parseContent(content: string, components: ComponentMap): ContentNode[] {
  const regExp = /<(\d+|[\w_]+)>(.*?)<\/\1>/gs;
  const result: ContentNode[] = [];
  let match;
  let lastIndex = 0;

  while ((match = regExp.exec(content)) !== null) {
    const [fullMatch, tag, innerContent] = match;

    if (match.index > lastIndex) {
      const text = content.substring(lastIndex, match.index);
      result.push({ type: 'text', children: text });
    }

    let Component;
    let props = {};

    if (isArrayComponentMap(components) && !isNaN(Number(tag))) {
      Component = components[parseInt(tag)];
    }

    if (isObjectComponentMap(components)) {
      Component = components[tag];
    }

    if (!Component) {
      warn(`No component found for tag <${tag}>.`);
      result.push(text(innerContent));
      lastIndex = match.index + fullMatch.length;
      continue;
    }

    if (isComponentWithProps(Component)) {
      props = Component.props || {};
      Component = Component.component;
    }

    if (typeof Component === 'string') {
      result.push(html(Component, parseContent(innerContent, components), props));
    } else {
      result.push(svelte(Component, parseContent(innerContent, components), props));
    }
    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    result.push(text(content.substring(lastIndex)));
  }

  return result;
}

export default parseContent;
