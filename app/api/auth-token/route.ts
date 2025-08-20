import { NextRequest, NextResponse } from 'next/server';
import { createAuthToken } from '@/lib/jwt-auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await createAuthToken(password);

    return NextResponse.json(
      {
        message: 'Login successful',
        token, // 返回 token 给前端
        expiresIn: 86400, // 24 hours in seconds
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
