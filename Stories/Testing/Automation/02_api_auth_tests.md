# Automation Test - Auth API

## Test File: `tests/integration/auth.test.ts`

## Test Objective
Automated tests for authentication endpoints (register, login, logout, session).

## Test Implementation

```typescript
import request from 'supertest';
import { MongoClient, Db } from 'mongodb';
import { app } from '@/app'; // Your Next.js app export
import { getDb } from '@/lib/db';

describe('Auth API Integration Tests', () => {
  let db: Db;
  let client: MongoClient;

  beforeAll(async () => {
    db = await getDb();
    client = await db.client;
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await db.collection('users').deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@1234'
        })
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'notanemail',
          password: 'Test@1234'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123'
        })
        .expect(400);

      expect(response.body.error).toContain('password');
    });

    it('should reject registration with duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User One',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Two',
          email: 'test@example.com',
          password: 'Test@5678'
        })
        .expect(409);

      expect(response.body.error).toBe('Email already registered');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body.error).toContain('required');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@1234'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@1234'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should enforce rate limiting after multiple failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(429);

      expect(response.body.error).toContain('Too many login attempts');
      expect(response.headers['retry-after']).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234'
        });

      sessionCookie = loginResponse.headers['set-cookie'][0];
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/session', () => {
    let sessionCookie: string;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test@1234'
        });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234'
        });

      sessionCookie = loginResponse.headers['set-cookie'][0];
    });

    it('should return user data for valid session', async () => {
      const response = await request(app)
        .get('/api/auth/session')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body.authenticated).toBe(true);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 for invalid session', async () => {
      const response = await request(app)
        .get('/api/auth/session')
        .expect(401);

      expect(response.body.authenticated).toBe(false);
    });
  });
});
```

## Coverage Requirements
- All API endpoints tested
- Success and error cases covered
- Edge cases tested (rate limiting, validation)
- Minimum 80% code coverage for auth services

## Execution
```bash
npm test -- tests/integration/auth.test.ts
```
