import { ObjectId } from 'mongodb';

export interface Post {
  _id?: ObjectId;
  title: string;
  body: string;
  featuredImageUrl?: string;
  categoryId: ObjectId; // Changed from string to ObjectId reference
  status: 'Draft' | 'Published';
  adminId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
