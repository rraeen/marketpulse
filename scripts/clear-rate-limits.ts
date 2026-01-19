/**
 * Script to clear all rate limit entries
 * Useful for development/testing when rate limits are blocking legitimate requests
 * 
 * Usage:
 *   npm run clear:rate-limits
 *   or
 *   ts-node scripts/clear-rate-limits.ts
 */

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { join } from "path";

// Manually load .env.local file
function loadEnvFile(): Record<string, string> {
  const envPath = join(process.cwd(), ".env.local");
  const envVars: Record<string, string> = {};

  try {
    const envFileBuffer = readFileSync(envPath);
    const envFile = envFileBuffer.toString('utf8');
    const lines = envFile.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          const cleanValue = value.replace(/^["']|["']$/g, "");
          envVars[key.trim()] = cleanValue;
        }
      }
    }
    console.log("✅ Loaded environment variables from .env.local");
    return envVars;
  } catch (error) {
    console.warn("⚠️  Could not load .env.local:", (error as Error).message);
    return {};
  }
}

const env = loadEnvFile();

async function clearRateLimits() {
  const uri = env.MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const collection = db.collection('rateLimits');

    const count = await collection.countDocuments();
    console.log(`📋 Found ${count} rate limit entries`);

    if (count > 0) {
      const result = await collection.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} rate limit entries`);
    } else {
      console.log("ℹ️  No rate limit entries to clear");
    }

    console.log("\n✨ Rate limits cleared successfully!");
  } catch (error) {
    console.error("❌ Failed to clear rate limits:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌 MongoDB connection closed");
  }
}

clearRateLimits();
