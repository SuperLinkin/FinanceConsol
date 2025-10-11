// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated rate limiting service

const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter configuration
 */
const RATE_LIMITS = {
  ai: {
    maxRequests: 100, // requests
    windowMs: 60 * 60 * 1000, // per hour
  },
  api: {
    maxRequests: 60, // requests
    windowMs: 60 * 1000, // per minute
  },
  upload: {
    maxRequests: 20, // requests
    windowMs: 60 * 1000, // per minute
  },
};

/**
 * Check rate limit for a given key
 * @param {string} identifier - User ID or IP address
 * @param {string} type - Rate limit type ('ai', 'api', 'upload')
 * @returns {Object} { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(identifier, type = 'api') {
  const config = RATE_LIMITS[type] || RATE_LIMITS.api;
  const key = `${type}:${identifier}`;
  const now = Date.now();

  let data = rateLimitStore.get(key);

  // Initialize or reset if window expired
  if (!data || now > data.resetTime) {
    data = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, data);
  }

  // Increment counter
  data.count++;

  const allowed = data.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - data.count);

  return {
    allowed,
    remaining,
    resetTime: data.resetTime,
    limit: config.maxRequests,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(rateLimitResult) {
  return {
    'X-RateLimit-Limit': rateLimitResult.limit.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
  };
}

/**
 * Middleware wrapper to apply rate limiting
 */
export async function withRateLimit(request, identifier, type, handler) {
  const rateLimit = checkRateLimit(identifier, type);

  if (!rateLimit.allowed) {
    const headers = getRateLimitHeaders(rateLimit);
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again after ${new Date(rateLimit.resetTime).toLocaleTimeString()}`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    );
  }

  // Execute handler and add rate limit headers to response
  const response = await handler(request);

  if (response instanceof Response) {
    const headers = getRateLimitHeaders(rateLimit);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}
