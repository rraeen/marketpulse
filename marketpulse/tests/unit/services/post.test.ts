import { createPost, updatePost, deletePost, getPostById, getPosts, isValidCategory, isValidStatus } from '@/lib/services/post';
import { getDb } from '@/lib/db';
import { Db, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

describe('Post Service Unit Tests', () => {
  let db: Db;
  let adminId: ObjectId;

  beforeAll(async () => {
    db = await getDb();

    // Create an admin user for testing
    const admin = await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'Admin',
      isPremiumInterested: false,
      createdAt: new Date(),
    });
    adminId = admin.insertedId;
  });

  afterAll(async () => {
    // Clean up admin user
    await db.collection('users').deleteOne({ _id: adminId });
  });

  beforeEach(async () => {
    // Clean posts before each test
    await db.collection('posts').deleteMany({});
  });

  describe('createPost', () => {
    it('should create a draft post with valid data', async () => {
      const post = await createPost({
        title: 'Test Post',
        body: 'This is a test post body',
        categoryId: 'Stocks',
        status: 'Draft',
        adminId,
        featuredImageUrl: '/uploads/test.jpg'
      });

      expect(post).toBeDefined();
      expect(post.title).toBe('Test Post');
      expect(post.body).toBe('This is a test post body');
      expect(post.categoryId).toBe('Stocks');
      expect(post.status).toBe('Draft');
      expect(post.adminId.toString()).toBe(adminId.toString());
      expect(post.createdAt).toBeInstanceOf(Date);
      expect(post.updatedAt).toBeInstanceOf(Date);
      expect(post._id).toBeDefined();
    });

    it('should create a published post', async () => {
      const post = await createPost({
        title: 'Published Post',
        body: 'Published content',
        categoryId: 'Investment Market Updates',
        status: 'Published',
        adminId
      });

      expect(post.status).toBe('Published');
      expect(post._id).toBeDefined();
    });

    it('should create post without featured image', async () => {
      const post = await createPost({
        title: 'Test Post',
        body: 'Test body',
        categoryId: 'Stocks',
        status: 'Draft',
        adminId
      });

      expect(post.featuredImageUrl).toBeUndefined();
    });

    it('should set timestamps correctly', async () => {
      const beforeCreate = new Date();
      const post = await createPost({
        title: 'Test Post',
        body: 'Test body',
        categoryId: 'Stocks',
        status: 'Draft',
        adminId
      });
      const afterCreate = new Date();

      expect(post.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(post.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
      expect(post.updatedAt.getTime()).toBe(post.createdAt.getTime());
    });
  });

  describe('updatePost', () => {
    let postId: ObjectId;

    beforeEach(async () => {
      const post = await createPost({
        title: 'Original Title',
        body: 'Original body',
        categoryId: 'Stocks',
        status: 'Draft',
        adminId
      });
      postId = post._id!;
    });

    it('should update post successfully', async () => {
      const updated = await updatePost(postId.toString(), {
        title: 'Updated Title',
        body: 'Updated body'
      });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.body).toBe('Updated body');
      expect(updated?.updatedAt).toBeInstanceOf(Date);
    });

    it('should change status from Draft to Published', async () => {
      const updated = await updatePost(postId.toString(), {
        status: 'Published'
      });

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('Published');
    });

    it('should return null for non-existent post', async () => {
      const fakeId = new ObjectId().toString();
      const updated = await updatePost(fakeId, {
        title: 'Updated'
      });

      expect(updated).toBeNull();
    });

    it('should throw error for invalid ObjectId', async () => {
      await expect(
        updatePost('invalid-id', { title: 'Updated' })
      ).rejects.toThrow();
    });
  });

  describe('deletePost', () => {
    let postId: ObjectId;

    beforeEach(async () => {
      const post = await createPost({
        title: 'Post to Delete',
        body: 'Body',
        categoryId: 'Stocks',
        status: 'Draft',
        adminId
      });
      postId = post._id!;
    });

    it('should delete post successfully', async () => {
      const deletedPost = await deletePost(postId.toString());
      
      expect(deletedPost).not.toBeNull();
      expect(deletedPost?.title).toBe('Post to Delete');

      // Verify it's actually deleted
      const checkPost = await db.collection('posts').findOne({ _id: postId });
      expect(checkPost).toBeNull();
    });

    it('should return null for non-existent post', async () => {
      const fakeId = new ObjectId().toString();
      const result = await deletePost(fakeId);
      expect(result).toBeNull();

      // Verify no posts were deleted
      const allPosts = await db.collection('posts').find({}).toArray();
      expect(allPosts.length).toBe(1); // The one from beforeEach
    });
  });

  describe('getPosts (service function)', () => {
    beforeEach(async () => {
      // Create test posts
      await db.collection('posts').insertMany([
        {
          title: 'Published Post 1',
          body: 'Content 1',
          categoryId: 'Stocks',
          status: 'Published',
          adminId: adminId,
          createdAt: new Date('2026-01-10'),
          updatedAt: new Date('2026-01-10')
        },
        {
          title: 'Draft Post',
          body: 'Draft content',
          categoryId: 'Stocks',
          status: 'Draft',
          adminId: adminId,
          createdAt: new Date('2026-01-11'),
          updatedAt: new Date('2026-01-11')
        },
        {
          title: 'Published Post 2',
          body: 'Content 2',
          categoryId: 'Commodities',
          status: 'Published',
          adminId: adminId,
          createdAt: new Date('2026-01-12'),
          updatedAt: new Date('2026-01-12')
        }
      ]);
    });

    it('should return only published posts when filtered by status', async () => {
      const result = await getPosts({ status: 'Published' }, { page: 1, limit: 10 });

      expect(result.posts.length).toBe(2);
      result.posts.forEach(post => {
        expect(post.status).toBe('Published');
      });
    });

    it('should filter by category', async () => {
      const result = await getPosts(
        { categoryId: 'Stocks', status: 'Published' }, 
        { page: 1, limit: 10 }
      );

      expect(result.posts.length).toBe(1);
      expect(result.posts[0].categoryId).toBe('Stocks');
      expect(result.posts[0].title).toBe('Published Post 1');
    });

    it('should support pagination', async () => {
      const result = await getPosts({ status: 'Published' }, { page: 1, limit: 1 });

      expect(result.posts.length).toBe(1);
      expect(result.page).toBe(1);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(1);
      expect(result.totalPages).toBe(2);
    });

    it('should return all posts when no pagination provided', async () => {
      const result = await getPosts({});

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3); // All posts
    });

    it('should sort by createdAt descending', async () => {
      const result = await getPosts({}) as any[];

      // Most recent first
      expect(result[0].title).toBe('Published Post 2'); // 2026-01-12
      expect(result[1].title).toBe('Draft Post'); // 2026-01-11
      expect(result[2].title).toBe('Published Post 1'); // 2026-01-10
    });
  });

  describe('getPostById', () => {
    let publishedPostId: ObjectId;
    let draftPostId: ObjectId;

    beforeEach(async () => {
      const published = await db.collection('posts').insertOne({
        title: 'Published Post',
        body: 'Published content',
        categoryId: 'Stocks',
        status: 'Published',
        adminId: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      publishedPostId = published.insertedId;

      const draft = await db.collection('posts').insertOne({
        title: 'Draft Post',
        body: 'Draft content',
        categoryId: 'Stocks',
        status: 'Draft',
        adminId: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      draftPostId = draft.insertedId;
    });

    it('should return published post by ID', async () => {
      const post = await getPostById(publishedPostId.toString());

      expect(post).toBeDefined();
      expect(post!.title).toBe('Published Post');
      expect(post!.status).toBe('Published');
    });

    it('should return draft post by ID', async () => {
      const post = await getPostById(draftPostId.toString());
      
      expect(post).toBeDefined();
      expect(post!.title).toBe('Draft Post');
      expect(post!.status).toBe('Draft');
    });

    it('should return null for non-existent post', async () => {
      const fakeId = new ObjectId().toString();
      const post = await getPostById(fakeId);
      expect(post).toBeNull();
    });
  });

  describe('isValidCategory', () => {
    it('should return true for valid categories', () => {
      expect(isValidCategory('Stocks')).toBe(true);
      expect(isValidCategory('Commodities')).toBe(true);
      expect(isValidCategory('Investment Market Updates')).toBe(true);
    });

    it('should return false for invalid categories', () => {
      expect(isValidCategory('InvalidCategory')).toBe(false);
      expect(isValidCategory('')).toBe(false);
      expect(isValidCategory(null)).toBe(false);
      expect(isValidCategory(undefined)).toBe(false);
    });
  });

  describe('isValidStatus', () => {
    it('should return true for valid statuses', () => {
      expect(isValidStatus('Draft')).toBe(true);
      expect(isValidStatus('Published')).toBe(true);
    });

    it('should return false for invalid statuses', () => {
      expect(isValidStatus('InvalidStatus')).toBe(false);
      expect(isValidStatus('Pending')).toBe(false);
      expect(isValidStatus('')).toBe(false);
      expect(isValidStatus(null)).toBe(false);
    });
  });
});
