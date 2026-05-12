/**
 * Redis-backed sliding-window rate limiter.
 * Provides an Elysia plugin factory for per-route rate limiting using Redis.
 * Uses a sliding window counter pattern for accurate request throttling.
 *
 * @module lib/rate-limiter
 */

import { Elysia } from 'elysia';
import { getRedisClient } from '@/lib/redis';
import { createChildLogger } from '@/lib/logger';
import { formatErrorResponse } from './response-helpers';

/** Rate limiter logger */
const logger = createChildLogger({ module: 'rate-limiter' });

/**
 * Configuration for a rate limiting rule.
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  readonly maxRequests: number;
  /** Time window in seconds */
  readonly windowSeconds: number;
  /** Prefix for Redis key (used to distinguish different limiters) */
  readonly keyPrefix: string;
}

/**
 * Extracts the client identifier from the request for rate limiting.
 * Uses the X-Forwarded-For header if available, falls back to "unknown".
 *
 * @param request - The incoming HTTP request
 * @returns A string identifier for the client
 */
function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return 'unknown';
}

/**
 * Creates a rate limiter Elysia plugin with the given configuration.
 * Uses Redis INCR + EXPIRE for a fixed-window counter approach.
 * Returns 429 Too Many Requests with a Retry-After header when the limit is exceeded.
 *
 * @param config - Rate limiting configuration
 * @returns Elysia plugin with rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return new Elysia({ name: `rate-limit-${config.keyPrefix}` }).onBeforeHandle(
    async ({ request, set }) => {
      const clientId = getClientIdentifier(request);
      const key = `ratelimit:${config.keyPrefix}:${clientId}`;

      try {
        const redis = getRedisClient();
        const current = await redis.incr(key);

        // Set TTL on first request in the window
        if (current === 1) {
          await redis.expire(key, config.windowSeconds);
        }

        // Attach rate limit headers
        const ttl = await redis.ttl(key);
        set.headers['X-RateLimit-Limit'] = String(config.maxRequests);
        set.headers['X-RateLimit-Remaining'] = String(Math.max(0, config.maxRequests - current));
        set.headers['X-RateLimit-Reset'] = String(Math.ceil(Date.now() / 1000) + Math.max(ttl, 0));

        if (current > config.maxRequests) {
          logger.warn({ clientId, key, current, limit: config.maxRequests }, 'Rate limit exceeded');
          set.status = 429;
          set.headers['Retry-After'] = String(Math.max(ttl, 1));
          return formatErrorResponse('RATE_LIMITED', 'Too many requests. Please try again later.');
        }
      } catch (error) {
        // If Redis is down, allow the request through to avoid complete lockout
        logger.error({ error }, 'Rate limiter Redis error — allowing request');
      }
    }
  );
}
