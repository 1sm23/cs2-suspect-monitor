import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedFromRequest } from './lib/auth';

export function middleware(request: NextRequest) {
  // Check if the path requires authentication
  const protectedPaths = ['/suspects', '/api/suspects', '/api/upload'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Allow access to login page and auth API
  if (request.nextUrl.pathname === '/login' || 
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname === '/api/health') {
    return NextResponse.next();
  }

  // Redirect to login if accessing protected path without authentication
  if (isProtectedPath && !isAuthenticatedFromRequest(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to suspects page if authenticated user tries to access login
  if (request.nextUrl.pathname === '/login' && isAuthenticatedFromRequest(request)) {
    return NextResponse.redirect(new URL('/suspects', request.url));
  }

  // Redirect root to suspects if authenticated, login if not
  if (request.nextUrl.pathname === '/') {
    if (isAuthenticatedFromRequest(request)) {
      return NextResponse.redirect(new URL('/suspects', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}