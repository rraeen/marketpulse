import { checkRateLimit, rateLimitStore } from '@/lib/utils/rate-limiter';

describe('Rate Limiter Unit Tests', () => {
  beforeEach(() => {
    // Clear rate limiter before each test
    rateLimitStore.clear();
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('test-user');
      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should allow up to 5 requests', () => {
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit('test-user');
        expect(result.allowed).toBe(true);
      }
    });

    it('should block after 5 requests', () => {
      // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-user');
      }

      // 6th request should be blocked
      const result = checkRateLimit('test-user');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track different identifiers separately', () => {
      // Max out user1
      for (let i = 0; i < 5; i++) {
        checkRateLimit('user1');
      }
      const blocked = checkRateLimit('user1');
      expect(blocked.allowed).toBe(false);

      // user2 should still be allowed
      const allowed = checkRateLimit('user2');
      expect(allowed.allowed).toBe(true);
    });

    it('should reset after time window', () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-user');
      }

      // Get the entry to check reset time
      const entry = rateLimitStore.get('test-user');
      expect(entry).toBeDefined();

      // Manually set reset time to past
      entry!.resetTime = Date.now() - 1000;
      rateLimitStore.set('test-user', entry!);

      // Should be allowed again
      const result = checkRateLimit('test-user');
      expect(result.allowed).toBe(true);
    });

    it('should provide retry-after in seconds', () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit('test-user');
      }

      const result = checkRateLimit('test-user');
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(900); // Max 15 minutes
    });
  });
});
