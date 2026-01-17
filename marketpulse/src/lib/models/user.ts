import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'User';
  isPremiumInterested: boolean;
  createdAt: Date;
}
