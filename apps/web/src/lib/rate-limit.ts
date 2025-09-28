import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const store = new Map<string, RequestRecord>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // Clean every minute

export function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers (for production with proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  if (realIp) {
    return realIp;
  }

  // Fallback for development environment
  try {
    return request.ip || '127.0.0.1';
  } catch (error) {
    // Fallback if request.ip is not available
    return '127.0.0.1';
  }
}

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } => {
    const ip = getClientIP(request);
    const now = Date.now();
    const key = `rate_limit:${ip}`;

    let record = store.get(key);

    // If no record or window expired, create new record
    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      store.set(key, record);

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: record.resetTime,
      };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    // Increment count
    record.count++;
    store.set(key, record);

    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  };
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});