import { NextResponse } from 'next/server';
import { getPostsByCategory, getPosts } from '@/lib/services/post';
import { getCategoryBySlug } from '@/lib/services/category';
import { ObjectId, type Filter } from 'mongodb';
import type { Post } from '@/lib/models/post';
import { getDb } from '@/lib/db';
import type { Category } from '@/lib/models/category';

async function attachCategoryNames(posts: Post[]) {
  const db = await getDb();
  const uniqueCategoryIds = Array.from(new Set(posts.map((p) => p.categoryId.toString()))).map(
    (id) => new ObjectId(id)
  );

  const categories = await db
    .collection<Category>('categories')
    .find({ _id: { $in: uniqueCategoryIds } })
    .project({ name: 1, slug: 1 })
    .toArray();

  const categoryNameById = new Map(categories.map((c) => [c._id!.toString(), c.name] as const));

  return posts.map((p) => ({
    ...p,
    categoryName: categoryNameById.get(p.categoryId.toString()) || 'Uncategorized',
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('categorySlug');
  const subcategorySlug = searchParams.get('subcategorySlug');
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

    // If categorySlug provided, filter by category/subcategory
    if (categorySlug) {
      const category = await getCategoryBySlug(categorySlug);
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }

      // If subcategorySlug provided, get specific subcategory
      if (subcategorySlug) {
        const subcategory = await getCategoryBySlug(subcategorySlug);
        if (!subcategory) {
          return NextResponse.json(
            { error: 'Subcategory not found' },
            { status: 404 }
          );
        }

        // Validate subcategory belongs to parent
        if (subcategory.parentId?.toString() !== category._id?.toString()) {
          return NextResponse.json(
            { error: 'Subcategory does not belong to specified category' },
            { status: 400 }
          );
        }

        // Get posts only from subcategory
        const { posts, total } = await getPostsByCategory(
          subcategory._id!,
          false,
          { page, limit }
        );

        return NextResponse.json(
          {
            posts: await attachCategoryNames(posts),
            category: {
              _id: category._id,
              name: category.name,
              slug: category.slug,
            },
            subcategory: {
              _id: subcategory._id,
              name: subcategory.name,
              slug: subcategory.slug,
            },
            total,
            page,
            totalPages: Math.ceil(total / limit),
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
          }
        );
      }

      // Get posts from category + all subcategories
      const { posts, total } = await getPostsByCategory(
        category._id!,
        true,
        { page, limit }
      );

      return NextResponse.json(
        {
          posts: await attachCategoryNames(posts),
          category: {
            _id: category._id,
            name: category.name,
            slug: category.slug,
          },
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        }
      );
    }

    // No category filter - return all published posts
    const filter: Filter<Post> = { status: 'Published' as const };
    const result = await getPosts(filter, { page, limit });
    if (Array.isArray(result)) {
      return NextResponse.json(await attachCategoryNames(result), {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    return NextResponse.json(
      {
        ...result,
        posts: await attachCategoryNames(result.posts),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Public get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
