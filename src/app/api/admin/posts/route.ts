import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-helper';
import { createPost, getPosts, isValidCategory, isValidStatus } from '@/lib/services/post';
import { ObjectId } from 'mongodb';

// Note: Admin authorization is handled by proxy for /api/admin/* routes

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Admin get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Admin create post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
