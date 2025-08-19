import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change_me';
const SESSION_COOKIE = 'cs2-admin-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export function createSession(): string {
  const sessionData = {
    authenticated: true,
    timestamp: Date.now()
  };
  
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
}

export function verifySession(sessionToken: string): boolean {
  try {
    const sessionData = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    if (!sessionData.authenticated) {
      return false;
    }
    
    const now = Date.now();
    const sessionAge = now - sessionData.timestamp;
    
    return sessionAge < SESSION_DURATION;
  } catch {
    return false;
  }
}

export function setAuthCookie(sessionToken: string): void {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION / 1000
  });
}

export function getAuthCookie(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export function clearAuthCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function isAuthenticated(): boolean {
  const sessionToken = getAuthCookie();
  if (!sessionToken) {
    return false;
  }
  
  return verifySession(sessionToken);
}