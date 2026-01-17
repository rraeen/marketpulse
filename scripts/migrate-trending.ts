/**
 * Migration script to add isTrending field to existing posts
 * Run with: npm run migrate:trending
 */

import * as fs from 'fs';
import * as path from 'path';
import { MongoClient } from 'mongodb';

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

async function migrateTrending() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }

  console.log('🔄 Starting trending field migration...');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const postsCollection = db.collection('posts');
    
    // Check how many posts don't have isTrending field
    const postsWithoutTrending = await postsCollection.countDocuments({
      isTrending: { $exists: false }
    });
    
    console.log(`📊 Found ${postsWithoutTrending} posts without isTrending field`);
    
    if (postsWithoutTrending === 0) {
      console.log('✅ All posts already have isTrending field. No migration needed.');
      return;
    }
    
    // Update all posts without isTrending to have isTrending: false
    const result = await postsCollection.updateMany(
      { isTrending: { $exists: false } },
      { $set: { isTrending: false } }
    );
    
    console.log(`✅ Migration complete! Updated ${result.modifiedCount} posts`);
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);
    
    // Verify migration
    const remainingWithoutTrending = await postsCollection.countDocuments({
      isTrending: { $exists: false }
    });
    
    if (remainingWithoutTrending === 0) {
      console.log('✅ Verification passed: All posts now have isTrending field');
    } else {
      console.warn(`⚠️  Warning: ${remainingWithoutTrending} posts still missing isTrending field`);
    }
    
    // Show sample of migrated posts
    const samplePosts = await postsCollection.find({})
      .limit(3)
      .project({ _id: 1, title: 1, isTrending: 1 })
      .toArray();
    
    console.log('\n📋 Sample posts after migration:');
    samplePosts.forEach(post => {
      console.log(`   - ${post.title}: isTrending = ${post.isTrending}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run migration
migrateTrending()
  .then(() => {
    console.log('\n✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
