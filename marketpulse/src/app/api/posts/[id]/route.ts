import { NextResponse } from 'next/server';
import { getPostById } from '@/lib/services/post';
import { isValidObjectId } from '@/lib/utils/objectid-validation';

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
    return NextResponse.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
