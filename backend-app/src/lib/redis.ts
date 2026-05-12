/**
 * Redis client module.
 * Provides a singleton Redis connection using ioredis.
 *
 * @module lib/redis
 */

import Redis from 'ioredis';
import { getRedisConfig } from '@/config';
import { loggers } from './logger';

/** Redis module logger */
const logger = loggers.redis();

/** Redis client singleton instance */
let redisClient: Redis | null = null;

/**
 * Creates and returns the Redis client instance.
 * Uses lazy initialization for the singleton pattern.
 *
 * @returns Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const config = getRedisConfig();

    logger.info({ host: config.host, port: config.port }, 'Connecting to Redis');

    redisClient = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableAutoPipelining: true,
      keepAlive: 10000,
      lazyConnect: false,
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('error', (error) => {
      logger.error({ error }, 'Redis connection error');
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  return redisClient;
}

/**
 * Closes the Redis connection.
 * Should be called during graceful shutdown.
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    logger.info('Closing Redis connection');
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}
