import { MongoClient } from "mongodb";
import { ensureCollectionSchemas } from "./schemas/validation";

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

let indexesEnsured = false;
let schemasEnsured = false;

export async function getDb() {
  const client = await clientPromise;
  const db = client.db();

  // Apply MongoDB schema validation (once per server start)
  if (!schemasEnsured) {
    await ensureCollectionSchemas(db);
    schemasEnsured = true;
  }

  // Create indexes (once per server start)
  if (!indexesEnsured) {
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("posts").createIndex({ title: "text", body: "text" });
    await db.collection("posts").createIndex({ status: 1 });
    await db.collection("posts").createIndex({ categoryId: 1 });
    indexesEnsured = true;
  }

  return db;
}
