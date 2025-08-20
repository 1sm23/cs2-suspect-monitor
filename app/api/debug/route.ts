import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedFromRequest } from '@/lib/jwt-auth';

export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await isAuthenticatedFromRequest(request);
    const cookies = request.cookies.getAll();
    
    return NextResponse.json({
      isAuthenticated,
      cookies: cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value ? 'present' : 'empty'
      })),
      headers: Object.fromEntries(request.headers.entries()),
      url: request.url,
      method: request.method
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}
