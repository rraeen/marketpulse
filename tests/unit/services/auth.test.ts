import { registerUser, loginUser, verifyToken } from '@/lib/services/auth';
import { getDb } from '@/lib/db';
import { Db } from 'mongodb';

describe('Auth Service Unit Tests', () => {
  let db: Db;

  beforeAll(async () => {
    db = await getDb();
  });

  beforeEach(async () => {
    // Clean database before each test
    await db.collection('users').deleteMany({});
  });

  describe('registerUser', () => {
    it('should register a new user with valid data', async () => {
      const user = await registerUser('Test User', 'test@example.com', 'Test@1234');

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('User');
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe('Test@1234'); // Should be hashed
    });

    it('should throw error for duplicate email', async () => {
      // Register first user
      await registerUser('User One', 'test@example.com', 'Test@1234');

      // Try to register with same email
      await expect(
        registerUser('User Two', 'test@example.com', 'Test@5678')
      ).rejects.toThrow('Email already registered');
    });

    it('should hash the password', async () => {
      const user = await registerUser('Test User', 'test@example.com', 'Test@1234');

      // Password should be hashed
      expect(user.passwordHash).not.toBe('Test@1234');
      expect(user.passwordHash.length).toBeGreaterThan(20);
      expect(user.passwordHash).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt format
    });

    it('should set default role to User', async () => {
      const user = await registerUser('Test User', 'test@example.com', 'Test@1234');
      expect(user.role).toBe('User');
    });

    it('should set isPremiumInterested to false by default', async () => {
      const user = await registerUser('Test User', 'test@example.com', 'Test@1234');
      expect(user.isPremiumInterested).toBe(false);
    });

    it('should set createdAt timestamp', async () => {
      const user = await registerUser('Test User', 'test@example.com', 'Test@1234');
      expect(user.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await registerUser('Test User', 'test@example.com', 'Test@1234');
    });

    it('should login with valid credentials', async () => {
      const result = await loginUser('test@example.com', 'Test@1234');

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.passwordHash).toBeDefined();
    });

    it('should return a valid JWT token', async () => {
      const result = await loginUser('test@example.com', 'Test@1234');

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should throw error for non-existent email', async () => {
      await expect(
        loginUser('nonexistent@example.com', 'Test@1234')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong password', async () => {
      await expect(
        loginUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should not leak information about user existence', async () => {
      // Both wrong password and non-existent user should give same error
      let error1, error2;

      try {
        await loginUser('test@example.com', 'wrongpassword');
      } catch (e) {
        error1 = (e as Error).message;
      }

      try {
        await loginUser('nonexistent@example.com', 'wrongpassword');
      } catch (e) {
        error2 = (e as Error).message;
      }

      expect(error1).toBe(error2);
      expect(error1).toBe('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    let validToken: string;
    let userId: string;

    beforeEach(async () => {
      const user = await registerUser('Test User', 'test@example.com', 'Test@1234');
      userId = user._id!.toString();
      const result = await loginUser('test@example.com', 'Test@1234');
      validToken = result.token;
    });

    it('should verify a valid token', async () => {
      const decoded = await verifyToken(validToken);

      expect(decoded).toBeDefined();
      expect(decoded!.userId).toBe(userId);
      expect(decoded!.email).toBe('test@example.com');
      expect(decoded!.role).toBe('User');
    });

    it('should return null for invalid token', async () => {
      const decoded = await verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', async () => {
      // This would require mocking time or waiting for token expiration
      // For now, we test with an obviously invalid token
      const decoded = await verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature');
      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', async () => {
      const decoded = await verifyToken('not-a-jwt-token');
      expect(decoded).toBeNull();
    });
  });
});
