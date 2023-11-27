import type { ComponentType } from 'svelte';
import type { i18n, InitOptions } from 'i18next';

export interface i18nLocals {
  i18n: i18n & { initOptions: Partial<InitOptions> };
}

export type Component = ComponentType | string | { component: Component; props?: any };

export type ComponentMap =
  | Component[]
  | {
      [key: string]: Component;
    };

export type ContentNode =
  | {
      type: 'text';
      children: string;
    }
  | {
      type: 'html';
      tag: string;
      props: Record<string, any>;
      children: ContentNode[];
    }
  | {
      type: 'svelte';
      component: Component;
      props: Record<string, any>;
      children: ContentNode[];
    };
