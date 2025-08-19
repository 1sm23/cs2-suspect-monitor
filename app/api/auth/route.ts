import { NextRequest, NextResponse } from 'next/server';
import { createAuthToken } from '@/lib/auth';

const COOKIE_NAME = 'cs2_admin_token';

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
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const token = await createAuthToken(password);
    const response = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 }
    );
    
    // Set cookie using NextResponse
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 86400, // 24 hours
      sameSite: 'lax',
      secure: false // 开发环境不使用HTTPS
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
    
    // Clear cookie using NextResponse
    response.cookies.set({
      name: COOKIE_NAME,
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
