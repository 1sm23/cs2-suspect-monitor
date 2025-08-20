import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedFromRequest } from './lib/jwt-auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log('Middleware:', pathname);

  // Skip internationalization for API routes
  if (pathname.startsWith('/api/')) {
    // Handle auth logic for API routes
    const protectedApiPaths = ['/api/suspects', '/api/upload'];
    const isProtectedApiPath = protectedApiPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (
      pathname.startsWith('/api/auth') ||
      pathname === '/api/health' ||
      pathname === '/api/debug'
    ) {
      return NextResponse.next();
    }

    if (isProtectedApiPath) {
      // 只使用Token认证
      const isAuthenticated = await isAuthenticatedFromRequest(request);

      console.log('API Auth check:', {
        token: isAuthenticated,
      });

      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    return NextResponse.next();
  }

  // 对于页面路由，让客户端自行处理认证检查
  // 这样可以避免服务端无法访问localStorage的问题
  console.log('Allowing page request to continue to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)', // Match all routes except static files
    '/', // Match root
  ],
};
