import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/suspects/[id]/history - Get status history for suspect
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const history = db.prepare(`
      SELECT * FROM suspect_status_history 
      WHERE suspect_id = ? 
      ORDER BY created_at DESC
    `).all(id);
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching status history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status history' },
      { status: 500 }
    );
  }
}