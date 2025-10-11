import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
];

// API routes that should be protected
const protectedApiRoutes = [
  '/api/openai',
  '/api/chat',
  '/api/consolidation',
  '/api/exchange-rates',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes without authentication
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session token in cookies
  const token = request.cookies.get('session_token')?.value;

  // If no token, redirect to login (for pages) or return 401 (for API)
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify JWT token
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
    );

    const { payload } = await jwtVerify(token, secret);

    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }

    // Add user info to request headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId || '');
    response.headers.set('x-user-email', payload.email || '');
    response.headers.set('x-user-role', payload.role || '');
    response.headers.set('x-company-id', payload.companyId || '');

    return response;

  } catch (error) {
    console.error('JWT verification failed:', error.message);

    // Clear invalid token
    const response = pathname.startsWith('/api/')
      ? NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        )
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('session_token');
    return response;
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
