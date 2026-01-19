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

    // Fix N+1 query: Batch fetch all unique category IDs
    const uniqueCategoryIds = [...new Set(trendingPosts.map(p => p.categoryId.toString()))];
    const categoriesMap = new Map();
    
    await Promise.all(
      uniqueCategoryIds.map(async (catId) => {
        const category = await getCategoryById(catId);
        if (category) {
          categoriesMap.set(catId, {
            _id: category._id,
            name: category.name,
            slug: category.slug,
          });
        }
      })
    );

    // Map posts with categories from the batch-fetched map
    const postsWithCategories = trendingPosts.map((post) => ({
      _id: post._id,
      title: post.title,
      featuredImageUrl: post.featuredImageUrl,
      category: categoriesMap.get(post.categoryId.toString()) || null,
      createdAt: post.createdAt,
    }));

    return NextResponse.json(
      {
        trending: postsWithCategories,
        total: postsWithCategories.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Get trending posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
