import { NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/r2';
import { randomUUID } from 'crypto';
import { requireCsrfToken } from '@/lib/utils/csrf';

// Note: Admin authorization is handled by proxy for /api/admin/* routes

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
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2 (preferred)
    const extByMime: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const ext = extByMime[file.type] ?? 'bin';
    const key = `uploads/${randomUUID()}.${ext}`;

    const { key: uploadedKey } = await uploadToR2({
      key,
      body: buffer,
      contentType: file.type,
      // Cache images for a long time; filenames are unique (UUID) so safe.
      cacheControl: 'public, max-age=31536000, immutable',
    });

    // Return an app-hosted URL so images render even if the bucket isn't public.
    return NextResponse.json({ url: `/api/uploads/${uploadedKey}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
