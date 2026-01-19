import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';
import { loginOrRegisterWithGoogle } from '@/lib/services/auth';

/**
 * Handles Google OAuth callback
 * Exchanges authorization code for user info and creates/logs in user
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=oauth_cancelled`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=oauth_failed`
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`
      );
    }

    // Exchange authorization code for tokens
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=oauth_failed`
      );
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || payload.given_name || 'User';
    const emailVerified = payload.email_verified || false;

    if (!email || !googleId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=oauth_missing_info`
      );
    }

    // Login or register user with Google credentials
    const { safeUser: user, token } = await loginOrRegisterWithGoogle({
      googleId,
      email,
      name,
      emailVerified,
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Redirect based on user role
    const redirectUrl = user.role === 'Admin' 
      ? '/admin' 
      : '/';

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${redirectUrl}`
    );
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    
    // Log detailed validation error if it's a MongoDB validation error
    if (error.code === 121 && error.errInfo) {
      console.error('MongoDB Validation Error Details:', {
        code: error.code,
        codeName: error.codeName,
        errInfo: error.errInfo,
        failingDocument: error.errInfo?.details?.schemaRulesNotSatisfied,
      });
    }
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login?error=oauth_error`
    );
  }
}
