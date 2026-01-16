import { NextResponse } from 'next/server';
import { getPosts, isValidCategory } from '@/lib/services/post';
import type { Filter } from 'mongodb';
import type { Post } from '@/lib/models/post';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' },
        { status: 400 }
      );
    }

    const filter: Filter<Post> = { status: 'Published' as const };
    
    // Validate category if provided
    if (categoryId) {
      if (!isValidCategory(categoryId)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
      filter.categoryId = categoryId;
    }

    const result = await getPosts(filter, { page, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Public get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
