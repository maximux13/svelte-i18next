export function warn(message: string) {
  console.warn('svelte-i18next:: ' + message);
}

export function error(message: string) {
  throw new Error('svelte-i18next:: ' + message);
}

/**
 * Joins multiple path segments into a single path string. The resulting path is normalized by removing any trailing slashes and ensuring that there is exactly one leading slash.
 *
 * @param paths - The path segments to join.
 * @returns The joined path string.
 */
export function join(...segments: string[]) {
  const cleanedSegments = segments.map((segment) => segment.replace(/^\/+|\/+$/g, ''));

  // Filter out any empty strings
  const nonEmptySegments = cleanedSegments.filter((segment) => segment.length > 0);

  // Join the segments using the forward slash separator
  let joinedPath = nonEmptySegments.join('/');

  // Add a leading slash if the original first segment had one
  if (segments.length > 0 && segments[0].startsWith('/')) {
    joinedPath = '/' + joinedPath;
  }

  return joinedPath;
}
