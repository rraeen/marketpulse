# Backend Story 02 - Trending Posts API

## Story ID
BE-TREND-02

## Story Title
As a backend developer, I need to create APIs for toggling trending status and fetching trending posts.

## Priority
High

## Story Points
5

## Description
Build API endpoints to allow admins to toggle the trending status of posts and provide a public endpoint to fetch trending posts for display in the sidebar.

## Requirements

### API Endpoints

#### 1. PATCH /api/admin/posts/:id/trending (Admin Only)
**Purpose:** Toggle or set the trending status of a post

**Request Body:**
```json
{
  "isTrending": true
}
```

**Response:**
```json
{
  "_id": "...",
  "title": "Post Title",
  "isTrending": true,
  "updatedAt": "2026-01-17T..."
}
```

**Logic:**
- Validate post exists
- Update `isTrending` field
- Update `updatedAt` timestamp
- Return updated post

**Validation:**
- isTrending must be boolean
- Only admin can access
- Post must exist

---

#### 2. GET /api/posts/trending (Public)
**Purpose:** Get all published trending posts (for sidebar)

**Query Parameters:**
- `limit`: Number of trending posts to return (default: 5, max: 20)
- `categoryId`: Optional, filter by category

**Response:**
```json
{
  "trending": [
    {
      "_id": "...",
      "title": "Trending Post 1",
      "featuredImageUrl": "/uploads/...",
      "category": {
        "_id": "...",
        "name": "Stocks",
        "slug": "stocks"
      },
      "createdAt": "2026-01-17T..."
    },
    {
      "_id": "...",
      "title": "Trending Post 2",
      ...
    }
  ],
  "total": 8
}
```

**Logic:**
- Query posts where `isTrending: true` AND `status: 'Published'`
- Sort by `createdAt` descending (newest first)
- Limit results (default 5)
- Populate category information
- Optional: filter by categoryId if provided

---

#### 3. Update Existing Endpoints

**PATCH /api/admin/posts/:id**
- Add `isTrending` to updatable fields
- Validate boolean type

**GET /api/posts**
- Include `isTrending` in response
- Optionally add `?trending=true` filter

**GET /api/posts/:id**
- Include `isTrending` in response

## Acceptance Criteria

### AC1: Toggle Trending Status
- [ ] PATCH /api/admin/posts/:id/trending works
- [ ] Only admins can access endpoint
- [ ] Non-admin returns 403
- [ ] Invalid post ID returns 404
- [ ] isTrending field updated correctly
- [ ] updatedAt timestamp updated

### AC2: Fetch Trending Posts
- [ ] GET /api/posts/trending returns trending posts
- [ ] Only published posts returned
- [ ] Only posts with isTrending: true returned
- [ ] Sorted by createdAt descending
- [ ] Limit parameter works (default 5, max 20)
- [ ] Category populated in response
- [ ] Public access (no auth required)

### AC3: Category Filtering
- [ ] categoryId query param filters results
- [ ] Invalid categoryId handled gracefully
- [ ] Empty result if no trending posts in category

### AC4: Existing Endpoints Updated
- [ ] PATCH /api/admin/posts/:id accepts isTrending
- [ ] GET /api/posts includes isTrending in response
- [ ] GET /api/posts/:id includes isTrending in response

### AC5: Performance
- [ ] Trending query uses index (fast performance)
- [ ] Response time <100ms

## Technical Notes

### Files to Create
1. `src/app/api/admin/posts/[id]/trending/route.ts` - Toggle trending
2. `src/app/api/posts/trending/route.ts` - Get trending posts

### Files to Modify
1. `src/app/api/admin/posts/[id]/route.ts` - Add isTrending to PATCH
2. `src/lib/services/post.ts` - Add trending query functions

### Service Functions to Add
```typescript
// src/lib/services/post.ts

// Toggle trending status
export async function toggleTrending(
  postId: string,
  isTrending: boolean
): Promise<Post | null> {
  const db = await getDb();
  const result = await db.collection<Post>('posts').findOneAndUpdate(
    { _id: new ObjectId(postId) },
    {
      $set: {
        isTrending,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );
  return result;
}

// Get trending posts
export async function getTrendingPosts(
  limit: number = 5,
  categoryId?: string
): Promise<Post[]> {
  const db = await getDb();
  
  const filter: any = {
    isTrending: true,
    status: 'Published'
  };
  
  if (categoryId) {
    filter.categoryId = new ObjectId(categoryId);
  }
  
  return await db.collection<Post>('posts')
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 20))
    .toArray();
}
```

### API Route Example (Toggle Trending)
```typescript
// src/app/api/admin/posts/[id]/trending/route.ts
import { NextResponse } from 'next/server';
import { toggleTrending } from '@/lib/services/post';
import { isValidObjectId } from '@/lib/utils/objectid-validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: 'Invalid post ID format' },
      { status: 400 }
    );
  }
  
  const { isTrending } = await request.json();
  
  if (typeof isTrending !== 'boolean') {
    return NextResponse.json(
      { error: 'isTrending must be a boolean' },
      { status: 400 }
    );
  }
  
  const post = await toggleTrending(id, isTrending);
  
  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(post);
}
```

### API Route Example (Get Trending)
```typescript
// src/app/api/posts/trending/route.ts
import { NextResponse } from 'next/server';
import { getTrendingPosts } from '@/lib/services/post';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5');
  const categoryId = searchParams.get('categoryId') || undefined;
  
  try {
    const trending = await getTrendingPosts(limit, categoryId);
    return NextResponse.json({
      trending,
      total: trending.length
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Dependencies
- BE-TREND-01 (Trending Post Model) must be completed

## Workflow
Developer → CreateAPIRoutes → ImplementServiceFunctions → AddValidation → TestEndpoints → Review

## Definition of Done
- [ ] Toggle trending endpoint implemented
- [ ] Get trending posts endpoint implemented
- [ ] Existing post endpoints updated
- [ ] Service functions added
- [ ] Authorization applied
- [ ] Validation implemented
- [ ] Error handling implemented
- [ ] Integration tests written and passing
- [ ] API documentation updated
- [ ] Code reviewed and merged
