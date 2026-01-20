import { checkRateLimit } from '@/lib/utils/rate-limiter';
import { getDb } from '@/lib/db';
import type { Db } from 'mongodb';

describe('Rate Limiter Unit Tests', () => {
  let db: Db;

  beforeAll(async () => {
    db = await getDb();
  });

  beforeEach(async () => {
    // Clear rate limiter entries before each test
    await db.collection('rateLimits').deleteMany({});
  });

  describe('checkRateLimit', () => {
    it('should allow first request', async () => {
      const result = await checkRateLimit('test-user');
      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should eventually block after too many requests', async () => {
      // In production MAX_ATTEMPTS is 5; in development it's higher.
      // Make enough requests to exceed both.
      let last = await checkRateLimit('test-user');
      for (let i = 0; i < 30; i++) {
        last = await checkRateLimit('test-user');
        if (!last.allowed) break;
      }

      const result = last;
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track different identifiers separately', async () => {
      // Max out user1
      let blocked = await checkRateLimit('user1');
      for (let i = 0; i < 30; i++) {
        blocked = await checkRateLimit('user1');
        if (!blocked.allowed) break;
      }
      expect(blocked.allowed).toBe(false);

      // user2 should still be allowed
      const allowed = await checkRateLimit('user2');
      expect(allowed.allowed).toBe(true);
    });

    it('should reset after time window', async () => {
      await checkRateLimit('test-user');

      // Force resetTime in the past
      await db.collection('rateLimits').updateOne(
        { identifier: 'test-user' },
        { $set: { resetTime: new Date(Date.now() - 1000) } }
      );

      // Should be allowed again
      const result = await checkRateLimit('test-user');
      expect(result.allowed).toBe(true);
    });

    it('should provide retry-after in seconds', async () => {
      let result = await checkRateLimit('test-user');
      for (let i = 0; i < 30; i++) {
        result = await checkRateLimit('test-user');
        if (!result.allowed) break;
      }
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(900); // Max 15 minutes
    });
  });
});
