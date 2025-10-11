import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Verify authentication from request headers (set by middleware)
 * or from cookies directly (fallback)
 */
export async function verifyAuth(request) {
  try {
    // First try to get user info from middleware headers
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');
    const companyId = request.headers.get('x-company-id');

    if (userId && userEmail) {
      return {
        userId,
        email: userEmail,
        role: userRole,
        companyId,
      };
    }

    // Fallback: verify token directly from cookies
    const cookies = request.cookies;
    const token = cookies.get('session_token')?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Middleware wrapper to protect API routes
 * Returns 401 if not authenticated
 */
export async function requireAuth(request, handler) {
  const user = await verifyAuth(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Pass user to handler
  return handler(request, user);
}

/**
 * Check if user has required role
 * Role hierarchy: primary_admin > admin > manager > user > viewer
 */
export function hasRole(userRole, requiredRole) {
  const roleHierarchy = {
    primary_admin: 5,
    admin: 4,
    manager: 3,
    user: 2,
    viewer: 1,
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Require specific role for API endpoint
 */
export async function requireRole(request, requiredRole, handler) {
  return requireAuth(request, async (req, user) => {
    if (!hasRole(user.role, requiredRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    return handler(req, user);
  });
}
