import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

// GET /api/suspects/[id]/evidence - Get evidence for suspect
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const evidence = db.prepare('SELECT * FROM evidence WHERE suspect_id = ? ORDER BY created_at DESC').all(id);
    return NextResponse.json(evidence);
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}

// POST /api/suspects/[id]/evidence - Add evidence for suspect
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const formData = await request.formData();
    
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let filePath = null;

    // Handle file upload if present
    if (file && file.size > 0) {
      const maxSize = parseInt(process.env.MAX_UPLOAD_SIZE || '10485760'); // 10MB default
      
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large' },
          { status: 413 }
        );
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const filename = `${Date.now()}-${file.name}`;
      const uploadPath = path.join(uploadsDir, filename);
      
      const bytes = await file.arrayBuffer();
      await writeFile(uploadPath, new Uint8Array(bytes));
      
      filePath = `/uploads/${filename}`;
    }

    const result = db.prepare(`
      INSERT INTO evidence (suspect_id, type, title, content, file_path)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, type, title, content, filePath);

    const evidence = db.prepare('SELECT * FROM evidence WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(evidence, { status: 201 });
  } catch (error) {
    console.error('Error adding evidence:', error);
    return NextResponse.json(
      { error: 'Failed to add evidence' },
      { status: 500 }
    );
  }
}

// DELETE /api/suspects/[id]/evidence - Delete evidence
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const url = new URL(request.url);
    const evidenceId = url.searchParams.get('evidenceId');
    
    if (!evidenceId) {
      return NextResponse.json(
        { error: 'Evidence ID required' },
        { status: 400 }
      );
    }

    const result = db.prepare('DELETE FROM evidence WHERE id = ?').run(parseInt(evidenceId));
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Evidence not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    return NextResponse.json(
      { error: 'Failed to delete evidence' },
      { status: 500 }
    );
  }
}