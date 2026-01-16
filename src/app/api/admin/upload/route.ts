import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve, normalize } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Note: Admin authorization is handled by proxy for /api/admin/* routes

export async function POST(request: Request) {

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = file.type.split('/')[1];
    const fileName = `${uuidv4()}.${extension}`;
    
    // Define upload directory and ensure it exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    // Construct file path and validate it's within the uploads directory
    const filePath = join(uploadsDir, fileName);
    const normalizedPath = normalize(resolve(filePath));
    const normalizedUploadsDir = normalize(resolve(uploadsDir));
    
    // Security: Ensure the final path is within the uploads directory
    if (!normalizedPath.startsWith(normalizedUploadsDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    await writeFile(filePath, buffer);
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
