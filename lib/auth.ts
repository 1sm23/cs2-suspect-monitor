import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE_NAME = 'cs2_admin_token';
const SECRET_KEY = process.env.ADMIN_PASSWORD || 'default_secret';

export function createAuthToken(password: string): string {
  const timestamp = Date.now().toString();
  const payload = `${password}:${timestamp}`;
  const signature = createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifyAuthToken(token: string): boolean {
  try {
    const [timestamp, signature] = token.split('.');
    if (!timestamp || !signature) return false;

    const payload = `${process.env.ADMIN_PASSWORD}:${timestamp}`;
    const expectedSignature = createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return false;
  return verifyAuthToken(token);
}

export function isAuthenticatedFromRequest(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  
  if (!token) return false;
  return verifyAuthToken(token);
}

export function setAuthCookie(response: Response, token: string): void {
  response.headers.set('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
}

export function clearAuthCookie(response: Response): void {
  response.headers.set('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}