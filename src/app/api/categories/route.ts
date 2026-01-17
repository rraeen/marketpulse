import { NextResponse } from 'next/server';
import { getCategoryTree } from '@/lib/services/category';

export async function GET() {
  try {
    const categories = await getCategoryTree();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
