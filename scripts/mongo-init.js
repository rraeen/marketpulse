// ============================================
// MongoDB Initialization Script
// ============================================
// This script runs when the MongoDB container first starts
// It creates the application database and user with appropriate permissions

db = db.getSiblingDB('marketpulse');

// Create application user with read/write permissions
db.createUser({
  user: 'marketpulse_app',
  pwd: 'marketpulse_password',
  roles: [
    {
      role: 'readWrite',
      db: 'marketpulse'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'passwordHash', 'name', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email'
        },
        passwordHash: {
          bsonType: 'string',
          description: 'hashed password'
        },
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 100
        },
        role: {
          enum: ['admin', 'user'],
          description: 'user role'
        },
        isPremiumInterested: {
          bsonType: 'bool'
        },
        createdAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('posts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'category', 'status', 'authorId'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200
        },
        content: {
          bsonType: 'string'
        },
        category: {
          enum: ['micro-economics', 'stocks', 'commodities', 'investment-market-updates', 'investment-guidance']
        },
        status: {
          enum: ['draft', 'published']
        },
        authorId: {
          bsonType: 'objectId'
        },
        featuredImage: {
          bsonType: 'string'
        },
        createdAt: {
          bsonType: 'date'
        },
        publishedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.posts.createIndex({ status: 1 });
db.posts.createIndex({ category: 1 });
db.posts.createIndex({ authorId: 1 });
db.posts.createIndex({ publishedAt: -1 });
db.posts.createIndex({ title: 'text', content: 'text' });

print('✅ MarketPulse database initialized successfully');
