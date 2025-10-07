/* eslint-disable no-console */
import { NextRequest } from 'next/server';
import Redis from 'ioredis';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// Storage interface
interface RateLimitStore {
  get(key: string): RequestRecord | null;
  set(key: string, record: RequestRecord): void;
  delete(key: string): void;
  cleanup(): void;
}

// In-memory store implementation
class InMemoryStore implements RateLimitStore {
  private store = new Map<string, RequestRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries periodically
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Clean every minute
  }

  get(key: string): RequestRecord | null {
    return this.store.get(key) || null;
  }

  set(key: string, record: RequestRecord): void {
    this.store.set(key, record);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Redis store implementation (async, but we'll handle it separately)
class RedisStore {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  async get(key: string): Promise<RequestRecord | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, record: RequestRecord): Promise<void> {
    try {
      const ttl = Math.ceil((record.resetTime - Date.now()) / 1000);
      await this.redis.setex(key, ttl, JSON.stringify(record));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }
}

// Store factory
function createStore(): RateLimitStore {
  const redisUrl = process.env.RATE_LIMIT_REDIS_URL;
  if (redisUrl) {
    console.log('Using Redis store for rate limiting');
    // For now, fall back to in-memory for synchronous operations
    // TODO: Implement async Redis rate limiting in a separate middleware
    return new InMemoryStore();
  } else {
    console.log('Using in-memory store for rate limiting');
    return new InMemoryStore();
  }
}

// Global store instance
const store = createStore();

export function getClientKey(request: NextRequest): string {
  const ip = getClientIP(request);

  // Try to get session ID from cookies
  const sessionId = request.cookies.get('session')?.value;

  if (sessionId) {
    return `${ip}:${sessionId}`;
  }

  return ip;
}

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
  return (request: NextRequest): RateLimitResult => {
    const clientKey = getClientKey(request);
    const now = Date.now();
    const key = `rate_limit:${clientKey}`;

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

// Helper to create rate limit response with headers
export function createRateLimitResponse(
  result: RateLimitResult,
  config: RateLimitConfig
): Response {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
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

export const logoutRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 logout attempts per minute
});
