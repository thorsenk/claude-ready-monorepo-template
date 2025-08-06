import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

// Redis-based rate limiting store
class RedisStore {
  private redis: Redis;
  
  constructor(redis: Redis) {
    this.redis = redis;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
    const results = await this.redis
      .multi()
      .incr(key)
      .expire(key, 900) // 15 minutes
      .ttl(key)
      .exec();

    const totalHits = results[0][1] as number;
    const ttl = results[2][1] as number;
    const resetTime = new Date(Date.now() + ttl * 1000);

    return { totalHits, resetTime };
  }

  async decrement(key: string): Promise<void> {
    await this.redis.decr(key);
  }

  async resetKey(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

// API rate limiter - general endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Strict rate limiter - authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each email to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts for this email',
    retryAfter: '1 hour'
  },
  keyGenerator: (req: Request) => {
    return req.body.email || req.ip;
  }
});

// Custom rate limiter with Redis
export function createRedisRateLimit(redis: Redis) {
  const store = new RedisStore(redis);
  
  return rateLimit({
    store: store as any,
    windowMs: 15 * 60 * 1000,
    max: 100
  });
}

// Progressive rate limiting based on user tier
export function createTieredRateLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    
    let maxRequests = 100; // default for free tier
    
    if (user?.tier === 'premium') {
      maxRequests = 1000;
    } else if (user?.tier === 'enterprise') {
      maxRequests = 10000;
    }
    
    // Apply dynamic rate limit
    const dynamicLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: maxRequests,
      keyGenerator: () => user?.id || req.ip
    });
    
    return dynamicLimiter(req, res, next);
  };
}

// Rate limiting middleware with custom responses
export function rateLimitWithCustomResponse(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return rateLimit({
    ...options,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: options.message || 'Too many requests, please try again later.',
        retryAfter: Math.round(options.windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
}