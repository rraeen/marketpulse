import { NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/services/category';
import { ObjectId } from 'mongodb';
import { isValidObjectId } from '@/lib/utils/objectid-validation';
import { requireCsrfToken } from '@/lib/utils/csrf';

// Note: Admin authorization is handled by proxy for /api/admin/* routes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: 'Invalid category ID format' },
      { status: 400 }
    );
  }

  try {
    const category = await getCategoryById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // CSRF protection
  const csrfCheck = await requireCsrfToken(request);
  if (!csrfCheck.valid) {
    return NextResponse.json(
      { error: csrfCheck.error || 'CSRF validation failed' },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: 'Invalid category ID format' },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();
    const updates: { name?: string; parentId?: ObjectId | null } = {};

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Category name must be a non-empty string' },
          { status: 400 }
        );
      }
      if (data.name.length > 100) {
        return NextResponse.json(
          { error: 'Category name must be 100 characters or less' },
          { status: 400 }
        );
      }
      updates.name = data.name.trim();
    }

    if (data.parentId !== undefined) {
      if (data.parentId === null) {
        updates.parentId = null;
      } else if (typeof data.parentId === 'string') {
        try {
          updates.parentId = new ObjectId(data.parentId);
        } catch {
          return NextResponse.json(
            { error: 'Invalid parentId format' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid parentId format' },
          { status: 400 }
        );
      }
    }

    const category = await updateCategory(id, updates);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Update category error:', err);

    if (err.message.includes('not found') || err.message.includes('already exists') || 
        err.message.includes('children') || err.message.includes('subcategory') || 
        err.message.includes('parent')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // CSRF protection
  const csrfCheck = await requireCsrfToken(request);
  if (!csrfCheck.valid) {
    return NextResponse.json(
      { error: csrfCheck.error || 'CSRF validation failed' },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: 'Invalid category ID format' },
      { status: 400 }
    );
  }

  try {
    await deleteCategory(id);
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Delete category error:', err);

    if (err.message.includes('not found')) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err.message.includes('active posts')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
