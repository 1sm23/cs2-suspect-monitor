import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

// POST /api/upload - Upload file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const maxSize = parseInt(process.env.MAX_UPLOAD_SIZE || '10485760'); // 10MB default
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 413 }
      );
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const filename = `${Date.now()}-${file.name}`;
    const uploadPath = path.join(uploadsDir, filename);
    
    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(uploadPath, new Uint8Array(bytes));
    
    const publicPath = `/uploads/${filename}`;
    
    return NextResponse.json({
      success: true,
      path: publicPath,
      filename: filename,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}