import { ObjectId } from 'mongodb';

export interface Post {
  _id?: ObjectId;
  title: string;
  body: string;
  featuredImageUrl?: string;
  categoryId: ObjectId; // Changed from string to ObjectId reference
  status: 'Draft' | 'Published';
  isTrending: boolean; // Flag for trending posts displayed in sidebar
  adminId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
