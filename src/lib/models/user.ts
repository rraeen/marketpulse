import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash?: string; // Optional for Google OAuth users
  googleId?: string; // Google OAuth user ID
  role: 'Admin' | 'User';
  isPremiumInterested: boolean;
  emailVerified: boolean;
  verificationStatus: 'Pending' | 'Verified';
  sessionVersion?: number; // Incremented to revoke all sessions
  createdAt: Date;
  updatedAt?: Date;
}
