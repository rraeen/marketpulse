import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-helper';
import { createPost, getPosts, isValidCategory, isValidStatus } from '@/lib/services/post';
import { serializePost, serializePosts } from '@/lib/utils/serialize';
import { ObjectId } from 'mongodb';

// Note: Admin authorization is handled by proxy for /api/admin/* routes

export async function GET() {
  try {
    const posts = await getPosts();
    // Serialize posts to ensure ObjectIds are converted to strings
    try {
      const serializedPosts = Array.isArray(posts) ? serializePosts(posts) : posts;
      return NextResponse.json(serializedPosts);
    } catch (serializeError) {
      console.error("Posts serialization error:", serializeError);
      // Fallback: return posts without serialization (NextResponse handles ObjectIds)
      return NextResponse.json(posts);
    }
  } catch (error) {
    console.error('Admin get posts error:', error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, body, featuredImageUrl, categoryId, status } = await request.json();

    if (!title || !body || !categoryId || !status) {
      return NextResponse.json(
        { error: 'Title, body, categoryId, and status are required' },
        { status: 400 }
      );
    }

    if (!isValidCategory(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    if (!isValidStatus(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be Draft or Published.' },
        { status: 400 }
      );
    }

    const post = await createPost({
      title,
      body,
      featuredImageUrl,
      categoryId,
      status,
      adminId: typeof user._id === 'string' ? new ObjectId(user._id) : user._id,
    });

    try {
      return NextResponse.json(serializePost(post), { status: 201 });
    } catch (serializeError) {
      console.error("Post serialization error:", serializeError);
      // Fallback: return post without serialization
      return NextResponse.json({
        ...post,
        _id: post._id?.toString() || '',
        adminId: post.adminId.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Admin create post error:', error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
