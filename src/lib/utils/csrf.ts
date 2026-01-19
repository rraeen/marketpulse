/**
 * CSRF Protection Utilities
 * Implements double-submit cookie pattern for CSRF protection
 */

import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generates a new CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Gets or creates a CSRF token for the current session
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  
  if (!token) {
    token = generateCsrfToken();
    cookieStore.set(CSRF_TOKEN_COOKIE, token, {
      httpOnly: false, // Must be readable by JavaScript for double-submit
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }
  
  return token;
}

/**
 * Validates CSRF token from request
 * Checks both header and cookie match (double-submit pattern)
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  // Skip CSRF for safe methods
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }
  
  // Get token from header
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER);
  if (!headerToken) {
    return false;
  }
  
  // Get token from cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  if (!cookieToken) {
    return false;
  }
  
  // Tokens must match (double-submit pattern)
  if (headerToken !== cookieToken) {
    return false;
  }
  
  // Additional origin/referer check for extra security
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');
  
  if (origin) {
    // Check origin matches expected host
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  } else if (referer) {
    // Fallback to referer check
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) {
        return false;
      }
    } catch {
      return false;
    }
  } else if (process.env.NODE_ENV === 'production') {
    // In production, require origin or referer
    return false;
  }
  
  return true;
}

/**
 * Middleware helper to validate CSRF for unsafe methods
 */
export async function requireCsrfToken(request: Request): Promise<{ valid: boolean; error?: string }> {
  const method = request.method.toUpperCase();
  
  // Only validate unsafe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true };
  }
  
  const isValid = await validateCsrfToken(request);
  if (!isValid) {
    return {
      valid: false,
      error: 'CSRF token validation failed. Please refresh the page and try again.',
    };
  }
  
  return { valid: true };
}
