import { NextResponse } from 'next/server';
import { toggleTrending, getPostById } from '@/lib/services/post';
import { isValidObjectId } from '@/lib/utils/objectid-validation';

// Note: Admin authorization is handled by proxy for /api/admin/* routes

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

  try {
    const { isTrending } = await request.json();

    if (typeof isTrending !== 'boolean') {
      return NextResponse.json(
        { error: 'isTrending must be a boolean' },
        { status: 400 }
      );
    }

    // Verify post exists first
    const existingPost = await getPostById(id);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = await toggleTrending(id, isTrending);

    if (!post) {
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      _id: post._id,
      title: post.title,
      isTrending: post.isTrending,
      updatedAt: post.updatedAt,
    });
  } catch (error) {
    console.error('Toggle trending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
