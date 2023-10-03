import { test } from 'vitest';

import parse from '$lib/utils/parse';

import type { ComponentType } from 'svelte';
import type { ComponentMap } from '$lib/types';

function text(text: string) {
  return { type: 'text', children: text };
}

function html(tag: string, children: any[] = [], props: any = {}) {
  return { type: 'html', tag, children, props };
}

function svelte(component: any, children: any[] = [], props: any = {}) {
  return { type: 'svelte', component, children, props };
}

test('should handle simple text without tags', ({ expect }) => {
  const content = 'Simple text';
  const components = [] as ComponentMap;
  const result = parse(content, components);
  expect(result).toEqual([text(content)]);
});

test('should handle text with numeric tags', ({ expect }) => {
  const content = 'Hello <0>world</0>';
  const components = ['strong'];
  const result = parse(content, components);
  expect(result).toEqual([text('Hello '), html('strong', [text('world')])]);
});

test('should handle text with named tags', ({ expect }) => {
  const content = 'Hello <strongTag>world</strongTag>';
  const components = { strongTag: 'strong' };
  const result = parse(content, components);
  expect(result).toEqual([text('Hello '), html('strong', [text('world')])]);
});

test('should handle nested tags', ({ expect }) => {
  const content = 'This is <0>bold <1>and italic</1></0>';
  const components = ['strong', 'em'];
  const result = parse(content, components);
  expect(result).toEqual([
    text('This is '),
    html('strong', [text('bold '), html('em', [text('and italic')])])
  ]);
});

test('should handle svelte components', ({ expect }) => {
  const FakeComponent = {} as ComponentType; // Just a placeholder for testing
  const content = 'This is a <0>svelte component</0>';
  const components = [FakeComponent];
  const result = parse(content, components);
  expect(result).toEqual([text('This is a '), svelte(FakeComponent, [text('svelte component')])]);
});

test('should handle components with props', ({ expect }) => {
  const FakeComponent = {} as ComponentType;
  const content = 'This is a <0>svelte component with props</0>';
  const components = [{ component: FakeComponent, props: { propKey: 'propValue' } }];
  const result = parse(content, components);
  expect(result).toEqual([
    text('This is a '),
    svelte(FakeComponent, [text('svelte component with props')], { propKey: 'propValue' })
  ]);
});

test('should handle unmatched tags', ({ expect }) => {
  const content = 'This is a <0>test</0> and <1>another test</1>';
  const components: ComponentMap = ['strong'];
  const result = parse(content, components);
  expect(result).toEqual([
    text('This is a '),
    html('strong', [text('test')]),
    text(' and '),
    text('another test')
  ]);
});

test('should handle consecutive tags', ({ expect }) => {
  const content = 'This is <0>bold</0><1>italic</1>';
  const components: ComponentMap = ['strong', 'em'];
  const result = parse(content, components);
  expect(result).toEqual([
    text('This is '),
    html('strong', [text('bold')]),
    html('em', [text('italic')])
  ]);
});
