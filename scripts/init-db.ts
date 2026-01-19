/**
 * Database Initialization Script
 * 
 * This script sets up MongoDB schemas and indexes.
 * Run this once per deployment/environment setup.
 * 
 * Usage:
 *   npm run init:db
 *   or
 *   ts-node scripts/init-db.ts
 */

import { MongoClient, Db } from "mongodb";
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

// Inline schema validation function to avoid ESM import issues
async function ensureCollectionSchemas(db: Db) {
  const usersSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "passwordHash", "role", "isPremiumInterested", "createdAt"],
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
        passwordHash: { bsonType: "string" },
        role: { enum: ["Admin", "User"] },
        isPremiumInterested: { bsonType: "bool" },
        sessionVersion: { bsonType: "int", minimum: 0 },
        createdAt: { bsonType: "date" },
      },
    },
  };

  const postsSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "body", "categoryId", "status", "isTrending", "adminId", "createdAt", "updatedAt"],
      properties: {
        title: { bsonType: "string" },
        body: { bsonType: "string" },
        featuredImageUrl: { bsonType: "string" },
        categoryId: { bsonType: "objectId" },
        status: { enum: ["Draft", "Published"] },
        isTrending: { bsonType: "bool" },
        adminId: { bsonType: "objectId" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  };

  const categoriesSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "order", "isActive", "createdAt", "updatedAt"],
      properties: {
        name: { bsonType: "string", minLength: 1, maxLength: 100 },
        slug: { bsonType: "string", pattern: "^[a-z0-9-]+$" },
        parentId: { bsonType: ["objectId", "null"] },
        order: { bsonType: "int", minimum: 0 },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
      },
    },
  };

  const notificationLogSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["postId", "sentAt", "status"],
      properties: {
        postId: { bsonType: "objectId" },
        userId: { bsonType: "objectId" },
        email: { bsonType: "string" },
        sentAt: { bsonType: "date" },
        status: { enum: ["Success", "Failed"] },
        error: { bsonType: "string" },
      },
    },
  };

  try {
    // Apply schemas (create or modify collections)
    for (const [name, schema] of [
      ["users", usersSchema],
      ["posts", postsSchema],
      ["categories", categoriesSchema],
      ["notificationLog", notificationLogSchema],
    ] as const) {
      await db
        .command({
          collMod: name,
          validator: schema,
          validationLevel: "strict",
          validationAction: "error",
        })
        .catch(async (err: any) => {
          if (err.codeName === "NamespaceNotFound") {
            await db.createCollection(name, {
              validator: schema,
              validationLevel: "strict",
              validationAction: "error",
            });
          } else {
            throw err;
          }
        });
    }
  } catch (error) {
    console.error("⚠️  Error applying schema validation:", error);
    throw error;
  }
}

async function initDatabase() {
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

    // 1. Apply schema validation
    console.log("📋 Applying schema validation...");
    await ensureCollectionSchemas(db);
    console.log("✅ Schema validation applied");

    // 2. Create indexes
    console.log("📊 Creating indexes...");

    // User indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("  ✓ users.email (unique)");

    // Post indexes
    await db.collection("posts").createIndex({ title: "text", body: "text" });
    console.log("  ✓ posts.text (title, body)");
    await db.collection("posts").createIndex({ status: 1 });
    console.log("  ✓ posts.status");
    await db.collection("posts").createIndex({ categoryId: 1 });
    console.log("  ✓ posts.categoryId");
    await db.collection("posts").createIndex({ status: 1, createdAt: -1 });
    console.log("  ✓ posts.status + createdAt");
    await db.collection("posts").createIndex({ categoryId: 1, status: 1, createdAt: -1 });
    console.log("  ✓ posts.categoryId + status + createdAt");
    await db.collection("posts").createIndex({ isTrending: 1, status: 1, createdAt: -1 });
    console.log("  ✓ posts.isTrending + status + createdAt");

    // Category indexes
    await db.collection("categories").createIndex({ slug: 1 }, { unique: true });
    console.log("  ✓ categories.slug (unique)");
    await db.collection("categories").createIndex({ parentId: 1 });
    console.log("  ✓ categories.parentId");
    await db.collection("categories").createIndex({ order: 1 });
    console.log("  ✓ categories.order");
    await db.collection("categories").createIndex({ isActive: 1 });
    console.log("  ✓ categories.isActive");
    await db.collection("categories").createIndex({ parentId: 1, isActive: 1, order: 1 });
    console.log("  ✓ categories.parentId + isActive + order");

    // OTP verification indexes
    await db.collection("otp_verifications").createIndex({ email: 1 });
    console.log("  ✓ otp_verifications.email");
    await db.collection("otp_verifications").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log("  ✓ otp_verifications.expiresAt (TTL)");
    await db.collection("otp_verifications").createIndex({ email: 1, purpose: 1, isUsed: 1 });
    console.log("  ✓ otp_verifications.email + purpose + isUsed");
    await db.collection("otp_verifications").createIndex({ createdAt: 1 });
    console.log("  ✓ otp_verifications.createdAt");

    // Notification log indexes
    try {
      await db.collection("notificationLog").createIndex({ postId: 1 });
      console.log("  ✓ notificationLog.postId");
      await db.collection("notificationLog").createIndex({ sentAt: 1 });
      console.log("  ✓ notificationLog.sentAt");
      await db.collection("notificationLog").createIndex({ status: 1 });
      console.log("  ✓ notificationLog.status");
    } catch (error) {
      console.log("  ⚠ notificationLog indexes skipped (collection may not exist)");
    }

    // Notification job indexes
    try {
      await db.collection("notificationJobs").createIndex({ postId: 1 });
      console.log("  ✓ notificationJobs.postId");
      await db.collection("notificationJobs").createIndex({ status: 1, createdAt: 1 });
      console.log("  ✓ notificationJobs.status + createdAt");
      await db.collection("notificationJobs").createIndex({ createdAt: 1 });
      console.log("  ✓ notificationJobs.createdAt");
    } catch (error) {
      console.log("  ⚠ notificationJobs indexes skipped (collection may not exist)");
    }

    // Rate limit indexes
    try {
      await db.collection("rateLimits").createIndex(
        { resetTime: 1 },
        { expireAfterSeconds: 0, name: "rateLimit_ttl" }
      );
      console.log("  ✓ rateLimits.resetTime (TTL)");
      await db.collection("rateLimits").createIndex(
        { identifier: 1 },
        { name: "rateLimit_identifier" }
      );
      console.log("  ✓ rateLimits.identifier");
    } catch (error) {
      console.log("  ⚠ rateLimits indexes skipped (collection may not exist)");
    }

    console.log("\n✨ Database initialization completed successfully!");
    console.log("💡 You can now run the application. Indexes are ready.");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌 MongoDB connection closed");
  }
}

initDatabase();
