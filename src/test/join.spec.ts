import { join } from '$lib/utils/misc';

import { describe, expect, it } from 'vitest';

describe('join', () => {
  it('should join path segments using the system-specific separator', () => {
    expect(join('path', 'to', 'file.txt')).toBe('path/to/file.txt');
    expect(join('path/', '/to/', '/file.txt')).toBe('path/to/file.txt');
    expect(join('/path', 'to', 'file.txt')).toBe('/path/to/file.txt');
    expect(join('/path/', '/to/', '/file.txt')).toBe('/path/to/file.txt');
  });

  it('should normalize the resulting path by removing any trailing slashes and ensuring that there is exactly one leading slash', () => {
    expect(join('path/', 'to/', 'file.txt/')).toBe('path/to/file.txt');
    expect(join('/path/', '/to/', '/file.txt/')).toBe('/path/to/file.txt');
    expect(join('path', 'to', 'file.txt')).toBe('path/to/file.txt');
    expect(join('/path', '/to', '/file.txt')).toBe('/path/to/file.txt');
  });

  it('should handle empty path segments', () => {
    expect(join('', 'path', '', 'to', '', 'file.txt')).toBe('path/to/file.txt');
    expect(join('', '', '', '')).toBe('');
  });
});
