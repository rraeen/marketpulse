import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'User';
  isPremiumInterested: boolean;
  emailVerified: boolean;
  verificationStatus: 'Pending' | 'Verified';
  sessionVersion?: number; // Incremented to revoke all sessions
  createdAt: Date;
  updatedAt?: Date;
}
