import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  console.log('Middleware:', pathname);

  // 简化的中间件 - 只处理基本路由，不做认证检查
  // 认证现在由客户端处理
  
  // 跳过API路由的国际化处理
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 对于页面路由，让客户端自行处理认证检查
  console.log('Allowing page request to continue to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)', // Match all routes except static files
    '/', // Match root
  ],
};
