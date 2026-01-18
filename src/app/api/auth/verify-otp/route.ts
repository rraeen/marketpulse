import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/services/otp';
import { verifyUserEmail } from '@/lib/services/auth';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    await verifyOTP(email, otp, 'Registration');

    // Mark user as verified
    await verifyUserEmail(email);

    return NextResponse.json(
      { message: 'Email verified successfully. You can now log in.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Verification failed';
    const statusCode = errorMessage.includes('No valid OTP') || 
                      errorMessage.includes('expired') || 
                      errorMessage.includes('Invalid OTP') ? 400 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
