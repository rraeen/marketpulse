import { NextResponse } from 'next/server';
import { reorderCategories } from '@/lib/services/category';
import { isValidObjectId } from '@/lib/utils/objectid-validation';
import { requireCsrfToken } from '@/lib/utils/csrf';

// Note: Admin authorization is handled by proxy for /api/admin/* routes

export async function PATCH(request: Request) {
  // CSRF protection
  const csrfCheck = await requireCsrfToken(request);
  if (!csrfCheck.valid) {
    return NextResponse.json(
      { error: csrfCheck.error || 'CSRF validation failed' },
      { status: 403 }
    );
  }
  try {
    const { categoryIds } = await request.json();

    if (!Array.isArray(categoryIds)) {
      return NextResponse.json(
        { error: 'categoryIds must be an array' },
        { status: 400 }
      );
    }

    if (categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'categoryIds array cannot be empty' },
        { status: 400 }
      );
    }

    // Validate all IDs
    for (const id of categoryIds) {
      if (!isValidObjectId(id)) {
        return NextResponse.json(
          { error: `Invalid category ID format: ${id}` },
          { status: 400 }
        );
      }
    }

    await reorderCategories(categoryIds);

    return NextResponse.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
