import { NextResponse } from 'next/server';
import { getTrendingPosts } from '@/lib/services/post';
import { getCategoryById } from '@/lib/services/category';
import { isValidObjectId } from '@/lib/utils/objectid-validation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const categoryId = searchParams.get('categoryId');

  try {
    // Validate limit parameter
    const limit = limitParam ? parseInt(limitParam) : 5;
    if (isNaN(limit) || limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Validate categoryId if provided
    if (categoryId && !isValidObjectId(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID format' },
        { status: 400 }
      );
    }

    // Get trending posts
    const trendingPosts = await getTrendingPosts(limit, categoryId ?? undefined);

    // Populate category information for each post
    const postsWithCategories = await Promise.all(
      trendingPosts.map(async (post) => {
        const category = await getCategoryById(post.categoryId.toString());
        
        return {
          _id: post._id,
          title: post.title,
          featuredImageUrl: post.featuredImageUrl,
          category: category ? {
            _id: category._id,
            name: category.name,
            slug: category.slug,
          } : null,
          createdAt: post.createdAt,
        };
      })
    );

    return NextResponse.json({
      trending: postsWithCategories,
      total: postsWithCategories.length,
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
