import { NextResponse } from 'next/server';
import { getCsrfToken } from '@/lib/utils/csrf';

/**
 * GET /api/csrf-token
 * Returns the CSRF token for the current session
 * Frontend should include this token in X-CSRF-Token header for unsafe methods
 */
export async function GET() {
  try {
    const token = await getCsrfToken();
    return NextResponse.json({ token });
  } catch (error) {
    console.error('CSRF token error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
