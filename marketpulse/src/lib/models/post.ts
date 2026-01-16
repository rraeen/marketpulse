import { ObjectId } from 'mongodb';
import { Category } from '../constants/categories';

export interface Post {
  _id?: ObjectId;
  title: string;
  body: string;
  featuredImageUrl?: string;
  categoryId: Category;
  status: 'Draft' | 'Published';
  adminId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
