/**
 * Fetch wrapper that automatically includes CSRF token
 * Use this for all authenticated API requests (POST, PATCH, DELETE, PUT)
 */

let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

/**
 * Gets the CSRF token, caching it to avoid multiple requests
 */
async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  // Return existing promise if already fetching
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  // Fetch new token
  csrfTokenPromise = fetch('/api/csrf-token')
    .then(async (res) => {
      if (!res.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      const data = await res.json();
      csrfTokenCache = data.token;
      return data.token;
    })
    .catch((error) => {
      csrfTokenPromise = null; // Reset promise on error
      throw error;
    });

  return csrfTokenPromise;
}

/**
 * Clears the cached CSRF token (useful after logout or token refresh)
 */
export function clearCsrfToken() {
  csrfTokenCache = null;
  csrfTokenPromise = null;
}

/**
 * Fetch wrapper that automatically includes CSRF token for unsafe methods
 * @param url - The URL to fetch
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise<Response>
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  
  // Only add CSRF token for unsafe methods
  if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
    try {
      const token = await getCsrfToken();
      
      // Merge headers, ensuring CSRF token is included
      const headers = new Headers(options.headers);
      headers.set('X-CSRF-Token', token);
      
      return fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      // Still make the request, but it will likely fail with CSRF error
      // This allows the error to be handled by the caller
      return fetch(url, options);
    }
  }
  
  // For safe methods (GET, HEAD, OPTIONS), no CSRF token needed
  return fetch(url, options);
}
