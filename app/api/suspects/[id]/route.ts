import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/suspects/[id] - Get single suspect
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const suspect = db.prepare('SELECT * FROM suspects WHERE id = ?').get(id);
    
    if (!suspect) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(suspect);
  } catch (error) {
    console.error('Error fetching suspect:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suspect' },
      { status: 500 }
    );
  }
}

// DELETE /api/suspects/[id] - Delete suspect
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    const result = db.prepare('DELETE FROM suspects WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting suspect:', error);
    return NextResponse.json(
      { error: 'Failed to delete suspect' },
      { status: 500 }
    );
  }
}