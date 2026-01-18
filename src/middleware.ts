import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Fail fast if JWT_SECRET is missing in production
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    // Only allow fallback in development
    console.warn('⚠️  JWT_SECRET not set, using fallback secret (development only)');
    return 'fallback-secret-dev-only';
  }
  return secret;
};

const JWT_SECRET = new TextEncoder().encode(getJwtSecret());

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Routes
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== 'Admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
  }

  // Protect Profile Routes (Generic Auth Check)
  if (pathname.startsWith('/api/profile')) {
    const token = request.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*', '/api/profile/:path*'],
};
