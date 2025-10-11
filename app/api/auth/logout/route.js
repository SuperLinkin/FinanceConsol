import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logoutUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      await logoutUser(token);
    }

    // Clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session_token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
