import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/auth';
import { validatePasswordStrength } from '@/lib/utils/password-validation';
import { createOTP } from '@/lib/services/otp';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Register user (creates user in pending state)
    const user = await registerUser(name, email, password);

    // Send OTP for email verification
    try {
      await createOTP(email, 'Registration', user._id);
    } catch (otpError) {
      console.error('Failed to send OTP:', otpError);
      // Continue - user is registered, they can request OTP again via resend
    }

    // Don't return password hash
    const userWithoutPassword = { ...user };
    // @ts-expect-error - removing passwordHash before returning to client
    delete userWithoutPassword.passwordHash;

    return NextResponse.json(
      { 
        message: 'Registration successful. Please check your email for the verification OTP.',
        user: userWithoutPassword 
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes('Email already registered')) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
