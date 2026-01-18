import { getDb } from '../db';
import { Post } from '../models/post';
import { ObjectId, type Filter } from 'mongodb';
import { notifyUsersOfNewPost } from './notification';
import { getCategoryById } from './category';

/**
 * Validate that a category exists and is active
 */
export async function validateCategory(categoryId: ObjectId): Promise<boolean> {
  try {
    const category = await getCategoryById(categoryId.toString());
    if (!category) {
      console.error(`Category not found: ${categoryId.toString()}`);
      return false;
    }
    if (!category.isActive) {
      console.error(`Category is inactive: ${categoryId.toString()}, name: ${category.name}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error validating category ${categoryId.toString()}:`, error);
    return false;
  }
}

/**
 * Get all subcategory IDs for a parent category
 */
export async function getSubcategoryIds(categoryId: ObjectId): Promise<ObjectId[]> {
  const db = await getDb();
  const categoriesCollection = db.collection('categories');

  const subcategories = await categoriesCollection
    .find({ parentId: categoryId, isActive: true })
    .project({ _id: 1 })
    .toArray();

  return subcategories.map((sub) => sub._id);
}

/**
 * Get posts by category (with or without subcategories)
 */
export async function getPostsByCategory(
  categoryId: ObjectId,
  includeSubcategories: boolean,
  pagination: { page: number; limit: number }
): Promise<{ posts: Post[]; total: number }> {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  let categoryIds = [categoryId];
  if (includeSubcategories) {
    const subcategoryIds = await getSubcategoryIds(categoryId);
    categoryIds = [...categoryIds, ...subcategoryIds];
  }

  const filter: Filter<Post> = {
    categoryId: { $in: categoryIds },
    status: 'Published',
  };

  const skip = (pagination.page - 1) * pagination.limit;

  const [posts, total] = await Promise.all([
    postsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .toArray(),
    postsCollection.countDocuments(filter),
  ]);

  return { posts, total };
}

export async function createPost(data: Omit<Post, '_id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  // Validate category exists and is active
  const isValid = await validateCategory(data.categoryId);
  if (!isValid) {
    throw new Error('Invalid or inactive category');
  }

  const newPost: Post = {
    ...data,
    isTrending: data.isTrending ?? false, // Default to false if not provided
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await postsCollection.insertOne(newPost);
  newPost._id = result.insertedId;

  // Trigger notification if created with Published status
  if (newPost.status === 'Published') {
    notifyUsersOfNewPost(newPost._id as ObjectId, newPost.title).catch(console.error);
  }

  return newPost;
}

export async function updatePost(id: string, data: Partial<Omit<Post, '_id' | 'createdAt' | 'updatedAt'>>) {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  // Validate category if being updated
  if (data.categoryId) {
    const isValid = await validateCategory(data.categoryId);
    if (!isValid) {
      throw new Error('Invalid or inactive category');
    }
  }

  const trimmedId = id.trim();
  console.log("updatePost - ID:", trimmedId, "Data keys:", Object.keys(data), "Status:", data.status);

  try {
    const objectId = new ObjectId(trimmedId);
    
    // First get the old post to check if it exists and for notification logic
    const oldPost = await postsCollection.findOne({ _id: objectId });
    
    if (!oldPost) {
      console.error("updatePost - Post not found for ID:", trimmedId);
      return null;
    }

    console.log("updatePost - Found old post:", {
      id: oldPost._id?.toString(),
      oldStatus: oldPost.status,
      newStatus: data.status,
    });

    // Use updateOne which is more reliable - it returns modifiedCount
    const updateResult = await postsCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      }
    );

    // Check if the update actually modified a document
    if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 0) {
      console.error("updatePost - Post not found during update:", trimmedId);
      return null;
    }

    if (updateResult.modifiedCount === 0) {
      // Post was found but no changes were made (data might be the same)
      console.log("updatePost - Post found but no changes made (data unchanged):", trimmedId);
      // Still return the post since the operation succeeded
      return oldPost;
    }

    // Fetch the updated post to return it
    const updatedPost = await postsCollection.findOne({ _id: objectId });
    
    if (!updatedPost) {
      // This shouldn't happen, but handle it
      console.error("updatePost - Update succeeded but couldn't fetch updated post:", trimmedId);
      return null;
    }

    console.log("updatePost - Successfully updated:", {
      id: updatedPost._id?.toString(),
      status: updatedPost.status,
      modifiedCount: updateResult.modifiedCount,
    });

    // Trigger notification if status changed from Draft to Published
    if (data.status === 'Published' && updatedPost) {
      notifyUsersOfNewPost(updatedPost._id as ObjectId, updatedPost.title).catch(console.error);
    }

    return updatedPost;
  } catch (error) {
    console.error("updatePost - Error:", error);
    throw error;
  }
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

  // Trim whitespace
  const trimmedId = id.trim();
  
  try {
    const objectId = new ObjectId(trimmedId);
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "getPostById - Querying with ID:",
        trimmedId,
        "ObjectId:",
        objectId.toString()
      );
    }
    
    // Query with ObjectId
    const post = await postsCollection.findOne({ _id: objectId });
    
    // If not found, try to find any post to verify DB connection (for debugging)
    if (!post) {
      if (process.env.NODE_ENV !== "production") {
        const count = await postsCollection.countDocuments({});
        console.log(
          "getPostById - Post not found. Total posts in collection:",
          count
        );

        // Try to find a post with similar ID (for debugging)
        const allPosts = await postsCollection.find({}).limit(10).toArray();
        console.log(
          "getPostById - Sample post IDs:",
          allPosts.map((p) => ({
            id: p._id?.toString(),
            title: p.title?.substring(0, 30),
          }))
        );
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.log("getPostById - Found post:", {
          id: post._id?.toString(),
          title: post.title?.substring(0, 30),
          status: post.status,
        });
      }
    }
    
    return post;
  } catch (error) {
    console.error("getPostById - error converting ID:", trimmedId, error);
    throw error;
  }
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

export function isValidStatus(status: unknown): status is Post['status'] {
  return status === 'Draft' || status === 'Published';
}

export async function deletePost(id: string) {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  const trimmedId = id.trim();
  console.log("deletePost - ID:", trimmedId);

  try {
    const objectId = new ObjectId(trimmedId);
    
    // First get the post to return it, then delete it
    // This ensures we return the deleted post even if there's a race condition
    const postToDelete = await postsCollection.findOne({ _id: objectId });
    
    if (!postToDelete) {
      console.log("deletePost - Post not found:", trimmedId);
      return null;
    }

    // Delete the post - use deleteOne which is more reliable
    const deleteResult = await postsCollection.deleteOne({ _id: objectId });
    
    if (deleteResult.deletedCount > 0) {
      console.log("deletePost - Successfully deleted:", {
        id: postToDelete._id?.toString(),
        title: postToDelete.title?.substring(0, 30),
        status: postToDelete.status,
        deletedCount: deleteResult.deletedCount,
      });
      return postToDelete;
    } else {
      // This shouldn't happen if we found the post above, but handle it anyway
      console.error("deletePost - Delete operation returned deletedCount 0:", trimmedId);
      return null;
    }
  } catch (error) {
    console.error("deletePost - Error:", error);
    throw error;
  }
}

/**
 * Toggle trending status of a post
 */
export async function toggleTrending(
  postId: string,
  isTrending: boolean
): Promise<Post | null> {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  try {
    const objectId = new ObjectId(postId);
    
    const result = await postsCollection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          isTrending,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result as Post | null;
  } catch (error) {
    console.error('toggleTrending - Error:', error);
    throw error;
  }
}

/**
 * Get trending posts (for sidebar display)
 */
export async function getTrendingPosts(
  limit: number = 5,
  categoryId?: string
): Promise<Post[]> {
  const db = await getDb();
  const postsCollection = db.collection<Post>('posts');

  const filter: Filter<Post> = {
    isTrending: true,
    status: 'Published',
  };

  if (categoryId) {
    try {
      filter.categoryId = new ObjectId(categoryId);
    } catch {
      // Invalid ObjectId, return empty array
      return [];
    }
  }

  // Limit to max 20
  const effectiveLimit = Math.min(Math.max(limit, 1), 20);

  const posts = await postsCollection
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(effectiveLimit)
    .toArray();

  return posts;
}
