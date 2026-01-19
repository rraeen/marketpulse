import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';
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

  // Check if user has a password (not a Google-only account)
  if (!user.passwordHash) {
    throw new Error('Invalid credentials. Please sign in with Google.');
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



  // Get current session version (default to 0 if not set)
  const sessionVersion = user.sessionVersion || 0;

  const token = await new SignJWT({
    userId: user._id?.toString(),
    email: user.email,
    role: user.role,
    sessionVersion, // Include session version in token
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
      $inc: { sessionVersion: 1 }, // Revoke all sessions after password reset
    }
  );
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    const tokenSessionVersion = (payload.sessionVersion as number) ?? 0;
    
    // Check session version against database
    const db = await getDb();
    const user = await db.collection<User>('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { sessionVersion: 1 } }
    );
    
    if (!user) {
      return null; // User doesn't exist
    }
    
    // If session version doesn't match, token is revoked
    // Handle undefined/null sessionVersion for existing users
    const userSessionVersion = user.sessionVersion ?? 0;
    if (tokenSessionVersion !== userSessionVersion) {
      return null; // Session revoked
    }
    
    return {
      userId,
      email: payload.email as string,
      role: payload.role as string,
      sessionVersion: tokenSessionVersion,
    };
  } catch (error) {
    // Log error in development for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.error('Token verification error:', error);
    }
    return null;
  }
}

/**
 * Revokes all sessions for a user by incrementing sessionVersion
 * This invalidates all existing JWT tokens for the user
 */
export async function revokeUserSessions(userId: string): Promise<void> {
  const db = await getDb();
  const usersCollection = db.collection<User>('users');
  
  await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $inc: { sessionVersion: 1 },
      $set: { updatedAt: new Date() },
    }
  );
}

/**
 * Login or register user with Google OAuth
 * If user exists with Google ID, logs them in
 * If user exists with email but no Google ID, links Google account
 * If user doesn't exist, creates new user with Google credentials
 */
export async function loginOrRegisterWithGoogle(data: {
  googleId: string;
  email: string;
  name: string;
  emailVerified: boolean;
}) {
  const db = await getDb();
  const usersCollection = db.collection<User>('users');

  // Check if user exists with this Google ID
  let user = await usersCollection.findOne({ googleId: data.googleId });

  if (user) {
    // User exists with Google ID - log them in
    const sessionVersion = user.sessionVersion || 0;

    const token = await new SignJWT({
      userId: user._id?.toString(),
      email: user.email,
      role: user.role,
      sessionVersion,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const { passwordHash, ...safeUser } = user;
    return { safeUser, token };
  }

  // Check if user exists with this email (maybe they registered with email/password)
  user = await usersCollection.findOne({ email: data.email });

  if (user) {
    // User exists with email - link Google account
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          googleId: data.googleId,
          // If Google verified the email, mark it as verified
          emailVerified: data.emailVerified || user.emailVerified,
          verificationStatus: data.emailVerified ? 'Verified' : user.verificationStatus,
          updatedAt: new Date(),
        },
      }
    );

    // Refresh user data
    const updatedUser = await usersCollection.findOne({ _id: user._id });
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    const sessionVersion = updatedUser.sessionVersion || 0;

    const token = await new SignJWT({
      userId: updatedUser._id?.toString(),
      email: updatedUser.email,
      role: updatedUser.role,
      sessionVersion,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const { passwordHash, ...safeUser } = updatedUser;
    return { safeUser, token };
  }

  // User doesn't exist - create new user with Google credentials
  const newUser: User = {
    name: data.name,
    email: data.email,
    googleId: data.googleId,
    role: 'User',
    isPremiumInterested: false,
    // Google-verified emails are automatically verified
    emailVerified: data.emailVerified,
    verificationStatus: data.emailVerified ? 'Verified' : 'Pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    // Explicitly set sessionVersion to 0 for new users
    sessionVersion: 0,
  };

  let result;
  try {
    result = await usersCollection.insertOne(newUser);
    newUser._id = result.insertedId;
  } catch (error: any) {
    // Log detailed validation error
    if (error.code === 121) {
      const errDetails = error.errInfo?.details || {};
      console.error('MongoDB Validation Error Details:', {
        code: error.code,
        codeName: error.codeName,
        message: error.message,
        failingFields: errDetails.schemaRulesNotSatisfied || 'Unknown',
        documentBeingInserted: {
          name: newUser.name,
          email: newUser.email,
          hasPasswordHash: !!newUser.passwordHash,
          hasGoogleId: !!newUser.googleId,
          role: newUser.role,
          isPremiumInterested: newUser.isPremiumInterested,
          emailVerified: newUser.emailVerified,
          verificationStatus: newUser.verificationStatus,
          hasSessionVersion: newUser.sessionVersion !== undefined,
          hasCreatedAt: !!newUser.createdAt,
          hasUpdatedAt: !!newUser.updatedAt,
        },
        fullErrorInfo: JSON.stringify(error.errInfo, null, 2),
      });
      
      // If it's a schema validation error, provide helpful message
      throw new Error(`Database schema validation failed. Please run 'npm run init:db' to update the schema. Error: ${error.message}`);
    }
    throw error;
  }

  const sessionVersion = newUser.sessionVersion || 0;

  const token = await new SignJWT({
    userId: newUser._id?.toString(),
    email: newUser.email,
    role: newUser.role,
    sessionVersion,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const { passwordHash, ...safeUser } = newUser;
  return { safeUser, token };
}
