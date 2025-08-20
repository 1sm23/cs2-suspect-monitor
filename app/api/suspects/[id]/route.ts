import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Suspect } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/suspects/[id] - 获取单个嫌疑人
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const suspect = db.prepare(`
      SELECT * FROM suspects WHERE id = ?
    `).get(id) as Suspect;

    if (!suspect) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(suspect);
  } catch (error) {
    console.error('Failed to fetch suspect:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suspect' },
      { status: 500 }
    );
  }
}

// DELETE /api/suspects/[id] - 删除嫌疑人
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const result = db.prepare(`
      DELETE FROM suspects WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Suspect deleted successfully' });
  } catch (error) {
    console.error('Failed to delete suspect:', error);
    return NextResponse.json(
      { error: 'Failed to delete suspect' },
      { status: 500 }
    );
  }
}

// PUT /api/suspects/[id] - 更新嫌疑人
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { nickname, category } = await request.json();

    const allowedCategories = ['confirmed', 'high_risk', 'suspected'];
    const finalCategory = allowedCategories.includes(category) ? category : undefined;

    const updates: string[] = [];
    const values: any[] = [];

    if (typeof nickname !== 'undefined') {
      updates.push('nickname = ?');
      values.push(nickname);
    }

    if (typeof finalCategory !== 'undefined') {
      updates.push('category = ?');
      values.push(finalCategory);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    values.push(id);

    const sql = `UPDATE suspects SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`;
    const result = db.prepare(sql).run(...values);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Suspect not found' },
        { status: 404 }
      );
    }

    const updatedSuspect = db.prepare(`
      SELECT * FROM suspects WHERE id = ?
    `).get(id) as Suspect;

    return NextResponse.json(updatedSuspect);
  } catch (error) {
    console.error('Failed to update suspect:', error);
    return NextResponse.json(
      { error: 'Failed to update suspect' },
      { status: 500 }
    );
  }
}
