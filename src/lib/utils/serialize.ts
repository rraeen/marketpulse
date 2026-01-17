import { ObjectId } from 'mongodb';
import { Post } from '../models/post';

/**
 * Serializes a Post document for JSON response
 * Converts ObjectId and Date fields to strings
 */
export function serializePost(post: Post): Omit<Post, '_id' | 'adminId' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  adminId: string;
  createdAt: string;
  updatedAt: string;
} {
  if (!post) {
    throw new Error('Post is null or undefined');
  }
  
  if (!post._id) {
    throw new Error('Post must have an _id to serialize');
  }
  
  if (!post.adminId) {
    throw new Error('Post must have an adminId to serialize');
  }
  
  return {
    ...post,
    _id: post._id.toString(),
    adminId: post.adminId.toString(),
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : new Date(post.createdAt).toISOString(),
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : new Date(post.updatedAt).toISOString(),
  };
}

/**
 * Serializes an array of Post documents
 */
export function serializePosts(posts: Post[]) {
  return posts.map(serializePost);
}
