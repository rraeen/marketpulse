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

    // Check if user exists and is pending verification
    const db = await getDb();
    const usersCollection = db.collection<User>('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified. Please log in.' },
        { status: 400 }
      );
    }

    // Create and send new OTP
    await createOTP(email, 'Registration', user._id);

    return NextResponse.json(
      { message: 'New OTP sent successfully. Please check your email.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend OTP error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
    const statusCode = errorMessage.includes('wait') || 
                      errorMessage.includes('exceeded') ? 429 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
