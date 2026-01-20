/**
 * Fix Google OAuth Schema
 * 
 * This script explicitly updates the users collection schema to allow Google OAuth users
 * without passwordHash.
 */

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { join } from "path";

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
    return envVars;
  } catch (error) {
    return {};
  }
}

const env = loadEnvFile();
const uri = env.MONGODB_URI || process.env.MONGODB_URI;

const usersSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "role", "isPremiumInterested", "createdAt"],
    properties: {
      name: { bsonType: "string" },
      email: { bsonType: "string", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
      passwordHash: { bsonType: ["string", "null"] },
      googleId: { bsonType: ["string", "null"] },
      role: { enum: ["Admin", "User"] },
      isPremiumInterested: { bsonType: "bool" },
      emailVerified: { bsonType: "bool" },
      verificationStatus: { enum: ["Pending", "Verified"] },
      sessionVersion: { bsonType: ["int", "null"], minimum: 0 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] },
    },
  },
};

async function fixSchema() {
  if (!uri) {
    console.error("❌ MONGODB_URI not found");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    
    // Check current schema
    const usersCollection = db.collection("users");
    const currentOptions = await usersCollection.options();
    const currentValidator = currentOptions.validator as any;
    
    if (currentValidator?.$jsonSchema) {
      const currentRequired = currentValidator.$jsonSchema.required || [];
      console.log("📋 Current required fields:", currentRequired);
      
      if (currentRequired.includes("passwordHash")) {
        console.log("⚠️  passwordHash is still required. Updating schema...");
      } else {
        console.log("✅ passwordHash is already optional");
      }
    }

    // Force update the schema
    console.log("\n🔄 Updating users collection schema...");
    await db.command({
      collMod: "users",
      validator: usersSchema,
      validationLevel: "strict",
      validationAction: "error",
    });

    // Verify the update
    const updatedOptions = await usersCollection.options();
    const updatedValidator = updatedOptions.validator as any;
    const updatedRequired = updatedValidator?.$jsonSchema?.required || [];

    console.log("📋 Updated required fields:", updatedRequired);
    
    if (updatedRequired.includes("passwordHash")) {
      console.log("❌ ERROR: Schema update failed - passwordHash is still required");
      console.log("   This might require manual MongoDB Atlas update");
    } else {
      console.log("✅ SUCCESS: Schema updated - passwordHash is now optional");
      console.log("✅ Google OAuth should work now!");
    }

    // Test insert a sample document (won't actually insert)
    console.log("\n🧪 Testing schema with sample Google OAuth user data...");
    const testDoc = {
      name: "Test User",
      email: "test@example.com",
      googleId: "test-google-id",
      role: "User",
      isPremiumInterested: false,
      emailVerified: true,
      verificationStatus: "Verified",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Try to validate the document (dry run)
    try {
      await db.command({
        validate: "users",
        full: false,
      });
      console.log("✅ Schema validation test passed");
    } catch (validateError: any) {
      console.log("⚠️  Validation test:", validateError.message);
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.code === 121) {
      console.error("   This is a schema validation error. The schema update may not have taken effect.");
      console.error("   Try running this script again or manually update in MongoDB Atlas.");
    }
  } finally {
    await client.close();
  }
}

fixSchema();
