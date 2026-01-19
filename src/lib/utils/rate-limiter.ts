/**
 * MongoDB-based rate limiter with shared store
 * Uses TTL indexes for automatic cleanup
 */

import { getDb } from '../db';

// More lenient in development to avoid blocking during testing
const RATE_LIMIT_WINDOW_MS = process.env.NODE_ENV === 'production' 
  ? 15 * 60 * 1000  // 15 minutes in production
  : 5 * 60 * 1000;  // 5 minutes in development
const MAX_ATTEMPTS = process.env.NODE_ENV === 'production' 
  ? 5   // 5 attempts in production
  : 20; // 20 attempts in development

interface RateLimitEntry {
  identifier: string;
  count: number;
  resetTime: Date;
  createdAt: Date;
}

/**
 * Ensures rate limit collection and indexes exist
 * Called once at startup or on first use
 */
let indexesCreated = false;
async function ensureRateLimitIndexes() {
  if (indexesCreated) return;
  
  try {
    const db = await getDb();
    const collection = db.collection<RateLimitEntry>('rateLimits');
    
    // Create TTL index on resetTime for automatic cleanup
    await collection.createIndex(
      { resetTime: 1 },
      { expireAfterSeconds: 0, name: 'rateLimit_ttl' }
    );
    
    // Create index on identifier for fast lookups
    await collection.createIndex(
      { identifier: 1 },
      { name: 'rateLimit_identifier' }
    );
    
    indexesCreated = true;
  } catch (error) {
    // Indexes might already exist, that's okay
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Rate limit index creation warning:', error);
    }
    indexesCreated = true; // Prevent retry loops
  }
}

/**
 * Checks if an identifier has exceeded the rate limit
 * Uses MongoDB for shared state across serverless instances
 * @param identifier - IP address or other identifier
 * @returns true if rate limit exceeded, false otherwise
 */
export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  await ensureRateLimitIndexes();
  
  const db = await getDb();
  const collection = db.collection<RateLimitEntry>('rateLimits');
  const now = new Date();
  
  // Find existing entry
  const entry = await collection.findOne({ identifier });
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const resetTime = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);
    await collection.updateOne(
      { identifier },
      {
        $set: {
          identifier,
          count: 1,
          resetTime,
          createdAt: now,
        },
      },
      { upsert: true }
    );
    return { allowed: true };
  }
  
  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetTime.getTime() - now.getTime()) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Increment count atomically
  await collection.updateOne(
    { identifier },
    { $inc: { count: 1 } }
  );
  
  return { allowed: true };
}

// Legacy in-memory store for backward compatibility (tests)
export const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Gets the client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check various headers for IP (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default identifier if IP cannot be determined
  return 'unknown';
}
