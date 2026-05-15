/**
 * Redis-based caching library.
 * Provides a flexible and type-safe wrapper around ioredis for application-level caching.
 * Supports automatic serialization/deserialization of JSON data.
 *
 * @module lib/cache
 */

import { getRedisClient } from './redis';
import { createChildLogger } from './logger';

/** Cache module logger */
const logger = createChildLogger({ module: 'cache' });

/** Default TTL for cached items (5 minutes) */
const DEFAULT_TTL_SECONDS = 300;

/**
 * Retrieves a value from the cache.
 *
 * @param key - Cache key
 * @returns The deserialized value of type T, or null if not found
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const data = await redis.get(key);

    if (!data) return null;

    return JSON.parse(data) as T;
  } catch (error) {
    logger.error({ key, error }, 'Failed to retrieve from cache');
    return null;
  }
}

/**
 * Stores a value in the cache with an optional TTL.
 *
 * @param key - Cache key
 * @param value - Value to store (will be JSON stringified)
 * @param ttlSeconds - Time-to-live in seconds (defaults to 300s / 5m)
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  try {
    const redis = getRedisClient();
    const data = JSON.stringify(value);

    if (ttlSeconds > 0) {
      await redis.set(key, data, 'EX', ttlSeconds);
    } else {
      await redis.set(key, data);
    }
  } catch (error) {
    logger.error({ key, error }, 'Failed to set cache');
  }
}

/**
 * Deletes a specific key from the cache.
 *
 * @param key - Cache key to remove
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.del(key);
  } catch (error) {
    logger.error({ key, error }, 'Failed to delete from cache');
  }
}

/**
 * Deletes all keys matching a specific pattern.
 * USE WITH CAUTION: This uses Redis 'KEYS' or 'SCAN' which can be slow on large datasets.
 * In production, we use SCAN to avoid blocking the event loop.
 *
 * @param pattern - Redis key pattern (e.g., "war:*")
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedisClient();
    let cursor = '0';
    const batchSize = 100;

    do {
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', batchSize);
      cursor = newCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');

    logger.debug({ pattern }, 'Cache invalidated by pattern');
  } catch (error) {
    logger.error({ pattern, error }, 'Failed to invalidate cache pattern');
  }
}
