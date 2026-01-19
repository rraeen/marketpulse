import { NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/lib/services/category';
import { ObjectId } from 'mongodb';
import { requireCsrfToken } from '@/lib/utils/csrf';

// Note: Admin authorization is handled by proxy for /api/admin/* routes

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Admin get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // CSRF protection
  const csrfCheck = await requireCsrfToken(request);
  if (!csrfCheck.valid) {
    return NextResponse.json(
      { error: csrfCheck.error || 'CSRF validation failed' },
      { status: 403 }
    );
  }

  try {
    const { name, parentId } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Category name must be 100 characters or less' },
        { status: 400 }
      );
    }

    // Validate parentId if provided
    let validatedParentId: ObjectId | null = null;
    if (parentId) {
      if (typeof parentId !== 'string') {
        return NextResponse.json(
          { error: 'Invalid parentId format' },
          { status: 400 }
        );
      }
      try {
        validatedParentId = new ObjectId(parentId);
      } catch {
        return NextResponse.json(
          { error: 'Invalid parentId format' },
          { status: 400 }
        );
      }
    }

    const category = await createCategory(name.trim(), validatedParentId);

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Create category error:', err);
    
    if (err.message.includes('already exists')) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err.message.includes('not found') || err.message.includes('subcategory')) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
