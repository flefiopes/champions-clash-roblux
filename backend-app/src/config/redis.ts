/**
 * Redis configuration module.
 * Provides Redis connection configuration.
 *
 * @module config/redis
 */

import { getEnvConfig } from './env';

/**
 * Redis connection configuration interface.
 */
export interface RedisConfig {
  readonly host: string;
  readonly port: number;
  readonly password: string | undefined;
}

/**
 * Retrieves the Redis configuration from environment variables.
 *
 * @returns Redis connection configuration object
 */
export function getRedisConfig(): RedisConfig {
  const env = getEnvConfig();

  return {
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
  };
}
