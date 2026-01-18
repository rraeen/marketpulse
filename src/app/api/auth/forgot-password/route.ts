import { NextResponse } from 'next/server';
import { createOTP } from '@/lib/services/otp';
import { getDb } from '@/lib/db';
import { User } from '@/lib/models/user';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const db = await getDb();
    const usersCollection = db.collection<User>('users');
    const user = await usersCollection.findOne({ email });

    // SECURITY: Always return success to prevent email enumeration
    // Even if user doesn't exist, return success message
    if (user) {
      try {
        await createOTP(email, 'PasswordReset', user._id);
      } catch (otpError) {
        // Log error but don't expose it to client
        console.error('Failed to create OTP:', otpError);
        
        // If it's a rate limit error, we should inform the user
        if (otpError instanceof Error && 
            (otpError.message.includes('wait') || otpError.message.includes('exceeded'))) {
          return NextResponse.json(
            { error: otpError.message },
            { status: 429 }
          );
        }
      }
    }

    // Always return success message (don't reveal if email exists)
    return NextResponse.json(
      { 
        message: 'If an account exists with this email, you will receive a password reset OTP shortly.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
