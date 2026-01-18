import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { getDb } from '../db';
import { User } from '../models/user';

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

/**
 * Register user with pending verification status
 * Sends OTP for email verification
 */
export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const db = await getDb();
  const usersCollection = db.collection<User>('users');

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    if (existingUser.emailVerified) {
      throw new Error('Email already registered');
    } else {
      // User exists but not verified - allow re-registration
      throw new Error('Email already registered. Please verify your email or request a new OTP.');
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  const newUser: User = {
    name,
    email,
    passwordHash,
    role: 'User',
    isPremiumInterested: false,
    emailVerified: false,
    verificationStatus: 'Pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);
  newUser._id = result.insertedId;

  return newUser;
}

/**
 * Login user - requires email verification
 */
export async function loginUser(email: string, password: string) {
  const db = await getDb();
  const usersCollection = db.collection<User>('users');

  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  if(user.role !="Admin"){
    if (!user.emailVerified || user.verificationStatus !== 'Verified') {
      throw new Error('Email not verified. Please verify your email before logging in.');
    }

  }

  // Check if email is verified



  const token = await new SignJWT({
    userId: user._id?.toString(),
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const { passwordHash, ...safeUser } = user;

  return { safeUser, token };
}

/**
 * Verify user's email with OTP
 */
export async function verifyUserEmail(email: string): Promise<void> {
  const db = await getDb();
  const usersCollection = db.collection<User>('users');

  await usersCollection.updateOne(
    { email },
    {
      $set: {
        emailVerified: true,
        verificationStatus: 'Verified',
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Reset user password
 * Also verifies email since OTP verification proves ownership
 */
export async function resetUserPassword(email: string, newPassword: string): Promise<void> {
  const db = await getDb();
  const usersCollection = db.collection<User>('users');

  const user = await usersCollection.findOne({ email });
  if (!user) {
    // Don't reveal if email exists (security)
    return;
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update password and verify email
  // Since the user successfully verified OTP, they've proven email ownership
  await usersCollection.updateOne(
    { email },
    {
      $set: {
        passwordHash,
        emailVerified: true,
        verificationStatus: 'Verified',
        updatedAt: new Date(),
      },
    }
  );

  // TODO: Invalidate all active sessions/tokens for this user
  // This would require a token blacklist or session management system
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}
