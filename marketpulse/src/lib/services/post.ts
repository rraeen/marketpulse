import { getDb } from '../db';
import { Post } from '../models/post';
import { ObjectId, type ModifyResult, type Filter } from 'mongodb';
import { Category, CATEGORIES } from '../constants/categories';
import { notifyUsersOfNewPost } from './notification';

export async function createPost(data: Omit<Post, '_id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  const newPost: Post = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await postsCollection.insertOne(newPost);
  newPost._id = result.insertedId;

  // Note: Notifications are only sent when status changes from Draft to Published
  // This happens in updatePost, not on initial creation

  return newPost;
}

export async function updatePost(id: string, data: Partial<Omit<Post, '_id' | 'createdAt' | 'updatedAt'>>) {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  const oldPost = await postsCollection.findOne({ _id: new ObjectId(id) });
  if (!oldPost) return null;

  const result = await postsCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  // MongoDB driver v7 returns ModifyResult with value property
  const updatedPost = (result as ModifyResult<Post> | null)?.value ?? null;

  // Trigger notification if status changed from Draft to Published
  if (oldPost.status === 'Draft' && data.status === 'Published' && updatedPost) {
    notifyUsersOfNewPost(updatedPost._id as ObjectId, updatedPost.title).catch(console.error);
  }

  return updatedPost;
}

export async function getPosts(
  filter: Filter<Post> = {},
  options?: { page?: number; limit?: number }
) {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  const query = postsCollection.find(filter).sort({ createdAt: -1 });

  if (options?.page && options?.limit) {
    const skip = (options.page - 1) * options.limit;
    const [posts, total] = await Promise.all([
      query.skip(skip).limit(options.limit).toArray(),
      postsCollection.countDocuments(filter),
    ]);

    return {
      posts,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  return query.toArray();
}

export async function getPostById(id: string) {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  return await postsCollection.findOne({ _id: new ObjectId(id) });
}

export async function searchPosts(query: string, page: number = 1, limit: number = 10) {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  const skip = (page - 1) * limit;

  const filter: Filter<Post> = {
    $text: { $search: query },
    status: 'Published' as const,
  };

  const [posts, total] = await Promise.all([
    postsCollection
      .find(filter)
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 }) // Fallback to createdAt if textScore unavailable
      .skip(skip)
      .limit(limit)
      .toArray(),
    postsCollection.countDocuments(filter),
  ]);

  return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function isValidCategory(category: unknown): category is Category {
  return CATEGORIES.includes(category as Category);
}

export function isValidStatus(status: unknown): status is Post['status'] {
  return status === 'Draft' || status === 'Published';
}

export async function deletePost(id: string) {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  const result = await postsCollection.findOneAndDelete({ _id: new ObjectId(id) });
  // MongoDB driver v7 returns ModifyResult with value property
  return (result as ModifyResult<Post> | null)?.value ?? null;
}
