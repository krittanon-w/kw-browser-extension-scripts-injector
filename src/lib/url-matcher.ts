/**
 * Converts a glob pattern to a Regular Expression.
 * Supports '*' as a wildcard matching any sequence of characters.
 */
export function globToRegex(pattern: string): RegExp {
  // Escape special characters, then replace '*' with '.*'
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexString = escaped.replace(/\*/g, '.*');
  // Add start and end anchors to ensure full match
  return new RegExp(`^${regexString}$`, 'i');
}

/**
 * Checks if a URL matches any of the provided glob patterns.
 */
export function matchesUrl(url: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  
  return patterns.some((pattern) => {
    try {
      const regex = globToRegex(pattern.trim());
      return regex.test(url);
    } catch (e) {
      console.error(`Invalid URL pattern: ${pattern}`, e);
      return false;
    }
  });
}
