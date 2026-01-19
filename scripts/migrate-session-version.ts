/**
 * Migration script to add sessionVersion field to existing users
 * Run this once to ensure all users have a sessionVersion field
 * 
 * Usage:
 *   npm run migrate:session-version
 *   or
 *   ts-node scripts/migrate-session-version.ts
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

async function migrateSessionVersion() {
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
    const usersCollection = db.collection('users');

    // Find all users without sessionVersion or with null/undefined sessionVersion
    const usersToUpdate = await usersCollection.find({
      $or: [
        { sessionVersion: { $exists: false } },
        { sessionVersion: null },
        { sessionVersion: undefined },
      ],
    }).toArray();

    if (usersToUpdate.length === 0) {
      console.log("✅ All users already have sessionVersion field");
      return;
    }

    console.log(`📋 Found ${usersToUpdate.length} users without sessionVersion`);

    // Update all users to have sessionVersion = 0
    const result = await usersCollection.updateMany(
      {
        $or: [
          { sessionVersion: { $exists: false } },
          { sessionVersion: null },
        ],
      },
      {
        $set: { sessionVersion: 0 },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with sessionVersion = 0`);
    console.log("\n✨ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌 MongoDB connection closed");
  }
}

migrateSessionVersion();
