# Backend Story 01 - Trending Post Model & Schema

## Story ID
BE-TREND-01

## Story Title
As a backend developer, I need to add an `isTrending` field to the Post model to support trending post designation.

## Priority
High

## Story Points
3

## Description
Add a boolean `isTrending` field to the Post model and update schema validation. This field allows admins to mark specific posts as trending, which will be displayed in a special sidebar on category pages.

## Requirements

### Post Model Update
Update the `Post` interface to include:
```typescript
interface Post {
  _id?: ObjectId;
  title: string;
  body: string;
  featuredImageUrl?: string;
  categoryId: ObjectId;
  status: 'Draft' | 'Published';
  isTrending: boolean;        // NEW FIELD
  adminId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Schema Validation
Update MongoDB schema validation for `posts` collection:
```javascript
{
  isTrending: {
    bsonType: 'bool',
    description: 'isTrending must be a boolean indicating if post is marked as trending'
  }
}
```

### Default Value
- New posts should default to `isTrending: false`
- Existing posts should be migrated to have `isTrending: false`

### Index Considerations
Add composite index for efficient trending post queries:
- `{ isTrending: 1, status: 1, createdAt: -1 }`

## Acceptance Criteria

### AC1: Model Updated
- [ ] Post interface includes `isTrending: boolean` field
- [ ] TypeScript types updated

### AC2: Schema Validation
- [ ] MongoDB schema validation includes isTrending field
- [ ] Field type enforced as boolean
- [ ] Invalid types rejected

### AC3: Default Value
- [ ] New posts default to `isTrending: false` if not specified
- [ ] Existing posts migrated to have `isTrending: false`

### AC4: Index Created
- [ ] Composite index created for trending queries
- [ ] Index improves query performance for trending posts

### AC5: Migration Script
- [ ] Script to add `isTrending: false` to existing posts
- [ ] Script runs successfully without errors

## Technical Notes

### Files to Modify
1. `src/lib/models/post.ts` - Update interface
2. `src/lib/schemas/validation.ts` - Update post schema
3. `src/lib/db.ts` - Add index for trending queries
4. `scripts/migrate-trending.ts` - Migration script (new file)

### Migration Script Example
```typescript
// scripts/migrate-trending.ts
import { getDb } from '@/lib/db';

async function migrateTrending() {
  const db = await getDb();
  
  const result = await db.collection('posts').updateMany(
    { isTrending: { $exists: false } },
    { $set: { isTrending: false } }
  );
  
  console.log(`Updated ${result.modifiedCount} posts`);
}

migrateTrending().catch(console.error);
```

### Index Creation
```typescript
// In src/lib/db.ts
await db.collection('posts').createIndex(
  { isTrending: 1, status: 1, createdAt: -1 }
);
```

## Dependencies
None

## Workflow
Developer → UpdatePostModel → ApplySchemaValidation → CreateIndex → MigrateExistingPosts → Test

## Definition of Done
- [ ] Post model updated with isTrending field
- [ ] Schema validation applied
- [ ] Index created
- [ ] Migration script written and executed
- [ ] Existing posts have isTrending: false
- [ ] Unit tests updated
- [ ] Code reviewed and merged
