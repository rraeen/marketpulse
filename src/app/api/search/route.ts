import { NextResponse } from 'next/server';
import { searchPosts } from '@/lib/services/post';
import { sanitizeSearchQuery } from '@/lib/utils/search-sanitization';
import { getDb } from '@/lib/db';
import type { Category } from '@/lib/models/category';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!rawQuery || rawQuery.trim() === '') {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' },
      { status: 400 }
    );
  }

  // Sanitize search query
  const sanitizedQuery = sanitizeSearchQuery(rawQuery);
  
  if (!sanitizedQuery || sanitizedQuery.trim() === '') {
    return NextResponse.json(
      { error: 'Search query contains only invalid characters' },
      { status: 400 }
    );
  }

  try {
    const results = await searchPosts(sanitizedQuery, page, limit);

    // Enrich posts with category name (avoid leaking raw IDs into UI)
    const db = await getDb();
    const posts = results.posts || [];
    const uniqueCategoryIds = Array.from(new Set(posts.map((p) => p.categoryId.toString()))).map(
      (id) => new ObjectId(id)
    );
    const categories = await db
      .collection<Category>('categories')
      .find({ _id: { $in: uniqueCategoryIds } })
      .project({ name: 1 })
      .toArray();
    const categoryNameById = new Map(categories.map((c) => [c._id!.toString(), c.name] as const));

    const postsWithCategory = posts.map((p) => ({
      ...p,
      categoryName: categoryNameById.get(p.categoryId.toString()) || 'Uncategorized',
    }));

    return NextResponse.json({ ...results, posts: postsWithCategory });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
