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
  createdAt: Date;
  updatedAt?: Date;
}
