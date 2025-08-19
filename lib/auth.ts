import { NextRequest } from 'next/server';

const COOKIE_NAME = 'cs2_admin_token';

// 使用Web Crypto API替代Node.js crypto
async function createHmacSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createAuthToken(password: string): Promise<string> {
  const timestamp = Date.now().toString();
  const payload = `${password}:${timestamp}`;
  const signature = await createHmacSignature(payload, process.env.ADMIN_PASSWORD || 'default_secret');
  return `${timestamp}.${signature}`;
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    const [timestamp, signature] = token.split('.');
    if (!timestamp || !signature) {
      console.log('Invalid token format');
      return false;
    }

    const payload = `${process.env.ADMIN_PASSWORD}:${timestamp}`;
    const expectedSignature = await createHmacSignature(payload, process.env.ADMIN_PASSWORD || 'default_secret');
    
    const isValid = signature === expectedSignature;
    console.log('Token verification:', { isValid, timestamp });
    return isValid;
  } catch (error) {
    console.log('Token verification error:', error);
    return false;
  }
}

export async function isAuthenticatedFromRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  
  console.log('Checking authentication, token:', token ? 'present' : 'missing');
  
  if (!token) return false;
  return await verifyAuthToken(token);
}