import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/services/auth';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/utils/rate-limiter';

export async function POST(request: Request) {
  try {
    // Rate limiting check
    const clientIp = getClientIp(request);
    const rateLimitCheck = checkRateLimit(`login:${clientIp}`);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitCheck.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitCheck.retryAfter || 900),
          },
        }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { safeUser: user, token } = await loginUser(email, password);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // In test mode, also return the token in the response for testing purposes
    const responseData: any = { message: 'Login successful', user };
    if (process.env.NODE_ENV === 'test') {
      responseData.token = token;
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message === 'Invalid credentials') {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
