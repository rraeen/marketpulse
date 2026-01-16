/**
 * Sanitizes search queries to prevent MongoDB injection attacks
 * and removes special characters that could interfere with text search
 */

export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove MongoDB special characters that could be used for injection
  // Keep alphanumeric, spaces, and common punctuation
  let sanitized = query.trim();

  // Remove or escape MongoDB text search special characters
  // $text search uses word boundaries, so we mainly need to prevent injection
  // Remove characters that could be used maliciously
  sanitized = sanitized.replace(/[${}]/g, '');

  // Limit length to prevent DoS
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}
