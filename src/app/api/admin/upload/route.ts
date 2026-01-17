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
    
    // Define upload directory - handle both development and production (Docker/standalone)
    // In Next.js standalone mode, public folder is copied to root
    // In development, it's in process.cwd()/public
    let uploadsDir: string;
    try {
      // Try standard location first
      uploadsDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Fallback: try root-level public/uploads (for standalone mode)
      try {
        uploadsDir = join(process.cwd(), 'uploads');
        await mkdir(uploadsDir, { recursive: true });
      } catch (fallbackError) {
        console.error('Failed to create uploads directory:', error, fallbackError);
        return NextResponse.json(
          { error: 'Failed to create upload directory. Check file system permissions.' },
          { status: 500 }
        );
      }
    }
    
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

    try {
      await writeFile(filePath, buffer);
      // Use relative URL that works in both dev and production
      const url = uploadsDir.includes('public') 
        ? `/uploads/${fileName}` 
        : `/uploads/${fileName}`;
      
      return NextResponse.json({ url });
    } catch (writeError) {
      console.error('Failed to write file:', writeError);
      return NextResponse.json(
        { error: 'Failed to save file. Check file system permissions.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
