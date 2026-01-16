import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

// Manually load .env.local file and return values
function loadEnvFile(): Record<string, string> {
  const envPath = join(process.cwd(), ".env.local");
  const envVars: Record<string, string> = {};

  try {
    const envFile = readFileSync(envPath, "utf-8");
    const lines = envFile.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          // Remove quotes if present
          const cleanValue = value.replace(/^["']|["']$/g, "");
          envVars[key.trim()] = cleanValue;
        }
      }
    }
    console.log("✅ Loaded environment variables from .env.local");
    return envVars;
  } catch (error) {
    console.warn("⚠️  Could not load .env.local:", (error as Error).message);
    console.warn("Make sure .env.local exists in the marketpulse/ directory");
    return {};
  }
}

const env = loadEnvFile();

async function seedAdmin() {
  const uri = env.MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("Available env keys:", Object.keys(env));
    throw new Error("MONGODB_URI not found");
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection("users");

    const adminEmail = "admin@marketpulse.com";
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const passwordHash = await bcrypt.hash("admin123", 10);
    await usersCollection.insertOne({
      name: "Admin User",
      email: adminEmail,
      passwordHash,
      role: "Admin",
      isPremiumInterested: false,
      createdAt: new Date(),
    });

    console.log("Admin user seeded successfully");
    console.log("Email: admin@marketpulse.com");
    console.log("Password: admin123");
  } finally {
    await client.close();
  }
}

seedAdmin().catch(console.error);
