export function warn(message: string) {
  console.warn('svelte-i18next:: ' + message);
}

export function error(message: string) {
  throw new Error('svelte-i18next:: ' + message);
}
