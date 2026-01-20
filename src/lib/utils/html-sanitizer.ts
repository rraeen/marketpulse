/**
 * Server-safe HTML sanitizer for Next.js server components
 * This avoids the ESM compatibility issues with isomorphic-dompurify/jsdom
 * 
 * Note: This is a basic sanitizer. For production use with untrusted content,
 * consider using a more robust solution or moving sanitization to the client.
 */

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'b', 'i',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'blockquote',
  'code', 'pre', 'div', 'span', 'section',
  'article', 'header', 'footer', 'main', 'aside',
  'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'title',
  'width', 'height', 'class', 'style'
];

/**
 * Sanitizes HTML content by removing dangerous tags and attributes
 * This is a simpler alternative to DOMPurify that works in serverless environments
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let sanitized = html;

  // Remove script tags and their content (case-insensitive, multiline)
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content (to prevent CSS injection)
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove iframe, embed, object tags (potential XSS vectors)
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.) - multiple patterns
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: and data: URLs in href and src attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*javascript:/gi, '$1="#removed"');
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']?\s*data:text\/html/gi, '$1="#removed"');
  
  // Remove dangerous attributes explicitly
  const dangerousAttrs = [
    'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload'
  ];
  dangerousAttrs.forEach(attr => {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
    const regex2 = new RegExp(`\\s*${attr}\\s*=\\s*[^\\s>]*`, 'gi');
    sanitized = sanitized.replace(regex2, '');
  });
  
  // Remove expression() in style attributes (IE-specific XSS)
  sanitized = sanitized.replace(/expression\s*\(/gi, '');
  
  // Since content is created by trusted admins, we allow most HTML
  // but remove the main XSS vectors above
  
  return sanitized;
}

/**
 * Alternative: Use DOMPurify if available (client-side), fallback to simple sanitizer (server-side)
 * This function tries to use DOMPurify but falls back gracefully
 */
export async function sanitizeHtmlSafe(html: string): Promise<string> {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // In server components, use simple sanitizer
  if (typeof window === 'undefined') {
    return sanitizeHtml(html);
  }

  // In client components, try to use DOMPurify
  try {
    const DOMPurify = (await import('dompurify')).default;
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
    });
  } catch {
    // Fallback to simple sanitizer
    return sanitizeHtml(html);
  }
}
