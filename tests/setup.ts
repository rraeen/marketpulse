import { MongoMemoryServer } from 'mongodb-memory-server';
import { rateLimitStore } from '@/lib/utils/rate-limiter';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test-secret-key-123';
  // NODE_ENV is read-only in TypeScript, use type assertion for test setup
  (process.env as { NODE_ENV?: string }).NODE_ENV = 'test';
  
  // Clear rate limiter store for tests
  rateLimitStore.clear();
}, 30000); // Increase timeout for MongoDB Memory Server startup

afterAll(async () => {
  if (mongod) {
    await mongod.stop();
  }
}, 30000);

beforeEach(() => {
  // Clear rate limiter before each test to avoid rate limit issues
  rateLimitStore.clear();
});
