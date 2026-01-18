import { NextResponse } from 'next/server';
import { getCategoryTree } from '@/lib/services/category';

const CATEGORIES_CACHE_CONTROL =
  'public, s-maxage=60, stale-while-revalidate=600';

export async function GET() {
  try {
    const categories = await getCategoryTree();
    return NextResponse.json(
      { categories },
      {
        headers: {
          'Cache-Control': CATEGORIES_CACHE_CONTROL,
        },
      }
    );
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
