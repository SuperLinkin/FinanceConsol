import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    console.log('Login attempt for username:', username);
    const result = await authenticateUser(username, password);
    console.log('Authentication result:', { success: result.success, error: result.error });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: result.user
    });

    // Set HTTP-only cookie for security
    response.cookies.set('session_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
