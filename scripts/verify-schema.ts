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

async function verifySchema() {
  if (!uri) {
    console.error("❌ MONGODB_URI not found");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const usersCollection = db.collection("users");
    
    // Get collection options to check validator
    const options = await usersCollection.options();
    const validator = options.validator as any;

    if (!validator || !validator.$jsonSchema) {
      console.log("⚠️  No schema validator found on users collection");
      return;
    }

    const schema = validator.$jsonSchema;
    const required = schema.required || [];

    console.log("\n📋 Current Users Collection Schema:");
    console.log("Required fields:", required);
    console.log("Has passwordHash in required?", required.includes("passwordHash"));
    console.log("Has googleId property?", !!schema.properties?.googleId);

    if (required.includes("passwordHash")) {
      console.log("\n❌ ERROR: passwordHash is still required! Schema update may have failed.");
      console.log("   Please run: npm run init:db");
    } else {
      console.log("\n✅ Schema is correct: passwordHash is optional");
      console.log("✅ Google OAuth should work now!");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

verifySchema();
