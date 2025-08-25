import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedFromRequest } from '@/lib/jwt-auth';
import { steamCache } from '@/lib/steam-cache';
import { getSteamPlayerSummaries } from '@/lib/steam';

export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await isAuthenticatedFromRequest(request);
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const steamId = url.searchParams.get('steamId');

    if (action === 'clearCache') {
      // 清除所有缓存
      steamCache.clear();
      return NextResponse.json({ message: 'Cache cleared successfully' });
    }

    if (action === 'testSteam' && steamId) {
      // 测试特定Steam ID
      try {
        const steamData = await getSteamPlayerSummaries([steamId]);
        return NextResponse.json({
          steamId,
          data: steamData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return NextResponse.json({
          steamId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 默认返回认证和缓存状态信息
    const cookies = request.cookies.getAll();
    const cacheStats = steamCache.getStats();

    return NextResponse.json({
      isAuthenticated,
      cookies: cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value ? 'present' : 'empty',
      })),
      cacheStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}
