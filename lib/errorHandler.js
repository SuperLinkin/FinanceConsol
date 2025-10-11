import { NextResponse } from 'next/server';

/**
 * Sanitize error messages for production
 * Only expose safe error messages to clients
 */
export function sanitizeError(error) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log full error server-side
  if (isDevelopment || process.env.ENABLE_CONSOLE_LOGS === 'true') {
    console.error('API Error:', error);
  }

  // Common safe error messages
  const safeErrors = {
    'Invalid credentials': 'Invalid credentials',
    'User not found': 'Invalid credentials',
    'Authentication required': 'Authentication required',
    'Insufficient permissions': 'Insufficient permissions',
    'Rate limit exceeded': 'Rate limit exceeded',
    'Invalid input': 'Invalid input',
    'Resource not found': 'Resource not found',
  };

  // Check if error message matches a safe error
  const errorMessage = error?.message || 'An error occurred';

  for (const [key, value] of Object.entries(safeErrors)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Return generic error for production, detailed for development
  return isDevelopment ? errorMessage : 'An unexpected error occurred';
}

/**
 * Standard error response helper
 */
export function errorResponse(error, status = 500) {
  const message = sanitizeError(error);

  return NextResponse.json(
    {
      error: message,
      ...(process.env.NODE_ENV === 'development' && {
        details: error?.message,
        stack: error?.stack,
      }),
    },
    { status }
  );
}

/**
 * Validation error response
 */
export function validationError(errors) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      errors: errors,
    },
    { status: 400 }
  );
}

/**
 * Success response helper
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}
