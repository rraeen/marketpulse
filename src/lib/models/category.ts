import { ObjectId } from 'mongodb';

export interface Category {
  _id?: ObjectId;
  name: string;
  slug: string;
  parentId: ObjectId | null; // null = main category, ObjectId = subcategory
  order: number; // for navbar positioning (0, 1, 2, 3...)
  isActive: boolean; // soft delete flag
  createdAt: Date;
  updatedAt: Date;
}
