import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri && process.env.NODE_ENV !== "test") {
  throw new Error("Please add your Mongo URI to .env.local");
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  // In development/test mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri || "mongodb://localhost:27017/test", options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri!, options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Get database instance.
 * 
 * NOTE: Schema validation and indexes should be set up via:
 *   npm run init:db
 * 
 * This is done at deployment time, not on every request.
 */
export async function getDb() {
  const client = await clientPromise;
  return client.db();
}
