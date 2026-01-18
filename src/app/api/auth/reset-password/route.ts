import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/services/otp';
import { resetUserPassword } from '@/lib/services/auth';
import { validatePassword } from '@/lib/utils/password-validation';

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    // Validate input
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character' 
        },
        { status: 400 }
      );
    }

    // Verify OTP
    await verifyOTP(email, otp, 'PasswordReset');

    // Reset password
    await resetUserPassword(email, newPassword);

    return NextResponse.json(
      { message: 'Password reset successfully. You can now log in with your new password.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
    const statusCode = errorMessage.includes('No valid OTP') || 
                      errorMessage.includes('expired') || 
                      errorMessage.includes('Invalid OTP') ? 400 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
