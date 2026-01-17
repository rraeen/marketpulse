import { NextResponse } from 'next/server';
import { getPostById } from '@/lib/services/post';
import { getCategoryById } from '@/lib/services/category';
import { isValidObjectId } from '@/lib/utils/objectid-validation';
import { ObjectId } from 'mongodb';

type CategoryInfo = {
  _id?: ObjectId;
  name: string;
  slug: string;
  parent?: {
    _id?: ObjectId;
    name: string;
    slug: string;
  };
} | null;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'Invalid post ID format' }, { status: 400 });
  }
  
  try {
    const post = await getPostById(id);
    if (!post || post.status !== 'Published') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Populate category information
    const category = await getCategoryById(post.categoryId.toString());
    
    let categoryInfo: CategoryInfo = null;
    if (category) {
      categoryInfo = {
        _id: category._id,
        name: category.name,
        slug: category.slug,
      };

      // If subcategory, include parent
      if (category.parentId) {
        const parent = await getCategoryById(category.parentId.toString());
        if (parent) {
          categoryInfo.parent = {
            _id: parent._id,
            name: parent.name,
            slug: parent.slug,
          };
        }
      }
    }

    return NextResponse.json({
      ...post,
      category: categoryInfo,
    });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
