import { NextRequest, NextResponse } from 'next/server';
import { steamCache } from '@/lib/steam-cache';

// GET /api/cache/stats - 获取缓存统计信息（用于调试）
export async function GET() {
  try {
    const stats = steamCache.getStats();
    return NextResponse.json({
      ...stats,
      message: '缓存统计信息'
    });
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

// DELETE /api/cache/stats - 清空缓存（用于调试）
export async function DELETE() {
  try {
    steamCache.clear();
    return NextResponse.json({
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
