// 简单的 Token 认证方案（不使用 JWT 库）
import { NextRequest } from 'next/server';

// 创建简单的认证 Token
export async function createAuthToken(password: string): Promise<string> {
  const timestamp = Date.now().toString();
  const payload = JSON.stringify({
    authenticated: true,
    timestamp,
    password_hash: await hashString(password),
  });

  const token = btoa(payload); // Base64 编码
  return token;
}

// 验证 Token
export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    const payload = JSON.parse(atob(token));
    const expectedHash = await hashString(
      process.env.ADMIN_PASSWORD || 'admin123'
    );

    // 检查 token 是否过期（24小时）
    const tokenAge = Date.now() - parseInt(payload.timestamp);
    const isExpired = tokenAge > 24 * 60 * 60 * 1000;

    return (
      !isExpired &&
      payload.authenticated &&
      payload.password_hash === expectedHash
    );
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
}

// 简单的哈希函数
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 从请求中获取 Token
export function getTokenFromRequest(request: NextRequest): string | null {
  // 1. 从 Authorization Header 获取
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. 从 Cookie 获取（备用方案）
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

// 检查用户是否已认证
export async function isAuthenticatedFromRequest(
  request: NextRequest
): Promise<boolean> {
  const token = getTokenFromRequest(request);
  if (!token) return false;

  return await verifyAuthToken(token);
}
