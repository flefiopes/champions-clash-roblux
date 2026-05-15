/**
 * Redis-backed sliding-window rate limiter.
 * Provides an Elysia plugin factory for per-route rate limiting using Redis.
 * Uses a sliding window counter pattern with atomic Redis Lua scripts.
 *
 * @module lib/rate-limiter
 */

import { Elysia } from 'elysia';
import { getRedisClient } from '@/lib/redis';
import { createChildLogger } from '@/lib/logger';
import { formatErrorResponse } from './response-helpers';
import { ip } from 'elysia-ip';

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
 * Lua script for atomic rate limiting.
 * Increments the counter and sets expiration only on the first increment.
 * Returns [currentCount, remainingTTL].
 */
const RATE_LIMIT_LUA = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("TTL", KEYS[1])
return {current, ttl}
`;

/**
 * Creates a rate limiter Elysia plugin with the given configuration.
 * Uses an atomic Lua script to prevent race conditions between INCR and EXPIRE.
 * Uses elysia-ip (via ip context) for reliable client identification.
 *
 * @param config - Rate limiting configuration
 * @returns Elysia plugin with rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return new Elysia({ name: `rate-limit-${config.keyPrefix}` })
    .use(ip())
    .onBeforeHandle(async ({ ip, set }) => {
      // Use the IP extracted by elysia-ip middleware
      const clientId = ip || 'unknown';
      const key = `ratelimit:${config.keyPrefix}:${clientId}`;

      try {
        const redis = getRedisClient();

        // Execute atomic Lua script
        const result = (await redis.eval(
          RATE_LIMIT_LUA,
          1,
          key,
          config.windowSeconds
        )) as unknown as [number, number];

        const [current, ttl] = result;

        // Attach standard rate limit headers
        set.headers['X-RateLimit-Limit'] = String(config.maxRequests);
        set.headers['X-RateLimit-Remaining'] = String(Math.max(0, config.maxRequests - current));
        set.headers['X-RateLimit-Reset'] = String(Math.ceil(Date.now() / 1000) + Math.max(ttl, 0));

        // Check if limit exceeded
        if (current > config.maxRequests) {
          logger.warn({ clientId, key, current, limit: config.maxRequests }, 'Rate limit exceeded');
          set.status = 429;
          set.headers['Retry-After'] = String(Math.max(ttl, 1));
          return formatErrorResponse('RATE_LIMITED', 'Too many requests. Please try again later.');
        }
      } catch (error) {
        // Fail-open: if Redis is down, allow the request to prevent total lockout
        logger.error({ error }, 'Rate limiter Redis error — allowing request (fail-open)');
      }
    });
}
