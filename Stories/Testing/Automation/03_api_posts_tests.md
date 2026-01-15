# Automation Test - Posts API

## Test File: `tests/integration/posts.test.ts`

## Test Objective
Automated tests for post management endpoints (CRUD operations, validation, permissions).

## Test Implementation

```typescript
import request from 'supertest';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { app } from '@/app';
import { getDb } from '@/lib/db';

describe('Posts API Integration Tests', () => {
  let db: Db;
  let client: MongoClient;
  let adminCookie: string;
  let adminId: ObjectId;

  beforeAll(async () => {
    db = await getDb();
    client = await db.client;

    // Create admin user
    const admin = await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'Admin',
      isPremiumInterested: false,
      createdAt: new Date(),
    });
    adminId = admin.insertedId;

    // Login admin
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'admin123'
      });
    adminCookie = loginResponse.headers['set-cookie'][0];
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    await db.collection('posts').deleteMany({});
  });

  describe('POST /api/admin/posts', () => {
    it('should create a draft post with valid data', async () => {
      const response = await request(app)
        .post('/api/admin/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'Test Post',
          body: 'This is a test post body',
          categoryId: 'Stocks',
          status: 'Draft',
          featuredImageUrl: '/uploads/test.jpg'
        })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('Test Post');
      expect(response.body.status).toBe('Draft');
      expect(response.body.adminId).toBeDefined();
    });

    it('should create a published post', async () => {
      const response = await request(app)
        .post('/api/admin/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'Published Post',
          body: 'Published content',
          categoryId: 'Investment Market Updates',
          status: 'Published'
        })
        .expect(201);

      expect(response.body.status).toBe('Published');
    });

    it('should reject post with invalid category', async () => {
      const response = await request(app)
        .post('/api/admin/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'Test Post',
          body: 'Test body',
          categoryId: 'InvalidCategory',
          status: 'Draft'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid category');
    });

    it('should reject post with invalid status', async () => {
      const response = await request(app)
        .post('/api/admin/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'Test Post',
          body: 'Test body',
          categoryId: 'Stocks',
          status: 'InvalidStatus'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid status');
    });

    it('should reject post with missing required fields', async () => {
      const response = await request(app)
        .post('/api/admin/posts')
        .set('Cookie', adminCookie)
        .send({
          title: 'Test Post'
          // missing body, categoryId, status
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/admin/posts')
        .send({
          title: 'Test Post',
          body: 'Test body',
          categoryId: 'Stocks',
          status: 'Draft'
        })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/admin/posts', () => {
    beforeEach(async () => {
      // Create test posts
      await db.collection('posts').insertMany([
        {
          title: 'Draft Post',
          body: 'Draft content',
          categoryId: 'Stocks',
          status: 'Draft',
          adminId: adminId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Published Post',
          body: 'Published content',
          categoryId: 'Commodities',
          status: 'Published',
          adminId: adminId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    });

    it('should return all posts for admin', async () => {
      const response = await request(app)
        .get('/api/admin/posts')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe('PATCH /api/admin/posts/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const post = await db.collection('posts').insertOne({
        title: 'Original Title',
        body: 'Original body',
        categoryId: 'Stocks',
        status: 'Draft',
        adminId: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      postId = post.insertedId.toString();
    });

    it('should update post successfully', async () => {
      const response = await request(app)
        .patch(`/api/admin/posts/${postId}`)
        .set('Cookie', adminCookie)
        .send({
          title: 'Updated Title',
          body: 'Updated body'
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.body).toBe('Updated body');
    });

    it('should change status from Draft to Published', async () => {
      const response = await request(app)
        .patch(`/api/admin/posts/${postId}`)
        .set('Cookie', adminCookie)
        .send({
          status: 'Published'
        })
        .expect(200);

      expect(response.body.status).toBe('Published');
      // Should trigger email notifications
    });

    it('should reject invalid ObjectId', async () => {
      const response = await request(app)
        .patch('/api/admin/posts/invalid-id')
        .set('Cookie', adminCookie)
        .send({
          title: 'Updated'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid post ID format');
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new ObjectId().toString();
      const response = await request(app)
        .patch(`/api/admin/posts/${fakeId}`)
        .set('Cookie', adminCookie)
        .send({
          title: 'Updated'
        })
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });
  });

  describe('DELETE /api/admin/posts/:id', () => {
    let postId: string;

    beforeEach(async () => {
      const post = await db.collection('posts').insertOne({
        title: 'Post to Delete',
        body: 'Body',
        categoryId: 'Stocks',
        status: 'Draft',
        adminId: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      postId = post.insertedId.toString();
    });

    it('should delete post successfully', async () => {
      await request(app)
        .delete(`/api/admin/posts/${postId}`)
        .set('Cookie', adminCookie)
        .expect(200);

      const deletedPost = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
      expect(deletedPost).toBeNull();
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new ObjectId().toString();
      const response = await request(app)
        .delete(`/api/admin/posts/${fakeId}`)
        .set('Cookie', adminCookie)
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });
  });

  describe('GET /api/posts (Public)', () => {
    beforeEach(async () => {
      await db.collection('posts').insertMany([
        {
          title: 'Published Post 1',
          body: 'Content 1',
          categoryId: 'Stocks',
          status: 'Published',
          adminId: adminId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Draft Post',
          body: 'Draft content',
          categoryId: 'Stocks',
          status: 'Draft',
          adminId: adminId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Published Post 2',
          body: 'Content 2',
          categoryId: 'Commodities',
          status: 'Published',
          adminId: adminId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    });

    it('should return only published posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.posts.length).toBe(2);
      response.body.posts.forEach((post: any) => {
        expect(post.status).toBe('Published');
      });
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/posts?categoryId=Stocks')
        .expect(200);

      expect(response.body.posts.length).toBe(1);
      expect(response.body.posts[0].categoryId).toBe('Stocks');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/posts?page=1&limit=1')
        .expect(200);

      expect(response.body.posts.length).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.total).toBe(2);
      expect(response.body.totalPages).toBe(2);
    });
  });

  describe('GET /api/posts/:id (Public)', () => {
    let publishedPostId: string;
    let draftPostId: string;

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
      publishedPostId = published.insertedId.toString();

      const draft = await db.collection('posts').insertOne({
        title: 'Draft Post',
        body: 'Draft content',
        categoryId: 'Stocks',
        status: 'Draft',
        adminId: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      draftPostId = draft.insertedId.toString();
    });

    it('should return published post', async () => {
      const response = await request(app)
        .get(`/api/posts/${publishedPostId}`)
        .expect(200);

      expect(response.body.title).toBe('Published Post');
      expect(response.body.status).toBe('Published');
    });

    it('should return 404 for draft post', async () => {
      const response = await request(app)
        .get(`/api/posts/${draftPostId}`)
        .expect(404);

      expect(response.body.error).toBe('Post not found');
    });
  });
});
```

## Coverage Requirements
- All CRUD operations tested
- Admin vs public access tested
- Validation and edge cases covered
- Minimum 85% code coverage for post services

## Execution
```bash
npm test -- tests/integration/posts.test.ts
```
