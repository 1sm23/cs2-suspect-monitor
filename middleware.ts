import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticatedFromRequest } from './lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log('Middleware:', pathname);
  
  // Skip internationalization for API routes
  if (pathname.startsWith('/api/')) {
    // Handle auth logic for API routes
    const protectedApiPaths = ['/api/suspects', '/api/upload'];
    const isProtectedApiPath = protectedApiPaths.some(path => 
      pathname.startsWith(path)
    );

    if (pathname.startsWith('/api/auth') || pathname === '/api/health') {
      return NextResponse.next();
    }

    if (isProtectedApiPath) {
      const isAuthenticated = await isAuthenticatedFromRequest(request);
      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    return NextResponse.next();
  }
  
  // Check if the path requires authentication
  const protectedPaths = ['/suspects'];
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  // Allow access to login page
  if (pathname === '/login') {
    console.log('Allowing access to:', pathname);
    return NextResponse.next();
  }

  const isAuthenticated = await isAuthenticatedFromRequest(request);
  console.log('Is authenticated:', isAuthenticated);

  // Redirect to login if accessing protected path without authentication
  if (isProtectedPath && !isAuthenticated) {
    console.log('Redirecting to login - not authenticated for protected path:', pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to suspects page if authenticated user tries to access login
  if (pathname === '/login' && isAuthenticated) {
    console.log('Redirecting to suspects - already authenticated');
    return NextResponse.redirect(new URL('/suspects', request.url));
  }

  // Redirect root to suspects if authenticated, login if not
  if (pathname === '/') {
    if (isAuthenticated) {
      console.log('Redirecting root to suspects - authenticated');
      return NextResponse.redirect(new URL('/suspects', request.url));
    } else {
      console.log('Redirecting root to login - not authenticated');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  console.log('Allowing request to continue to:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',  // Match all routes except static files
    '/'  // Match root
  ]
};