/**
 * Token store service module.
 * Manages refresh tokens in Redis for session management.
 * Supports token storage, validation, revocation, and blacklisting.
 *
 * @module services/auth/token-store
 */

import { getRedisClient } from '@/lib/redis';
import { getEnvConfig } from '@/config';
import { createChildLogger } from '@/lib/logger';

/** Token store logger */
const logger = createChildLogger({ module: 'token-store' });

/** Redis key prefixes for token management */
const KEYS = {
  /** Active refresh tokens by user */
  refreshToken: (userId: string, tokenId: string) => `auth:refresh:${userId}:${tokenId}`,
  /** Blacklisted tokens (for logout) */
  blacklist: (tokenId: string) => `auth:blacklist:${tokenId}`,
} as const;

/**
 * Parses a duration string (e.g., "7d", "15m") to seconds.
 *
 * @param duration - Duration string (s/m/h/d suffix)
 * @returns Duration in seconds, defaults to 7 days
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 604800;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return 604800;
  }
}

/**
 * Stores a refresh token in Redis with TTL matching JWT expiration.
 *
 * @param userId - User ID
 * @param tokenId - JWT ID (jti claim)
 */
export async function storeRefreshToken(userId: string, tokenId: string): Promise<void> {
  const redis = getRedisClient();
  const env = getEnvConfig();
  const ttl = parseDuration(env.jwt.refreshExpiresIn);

  const key = KEYS.refreshToken(userId, tokenId);
  await redis.set(key, '1', 'EX', ttl);

  logger.debug({ userId, tokenId }, 'Refresh token stored');
}

/**
 * Checks if a refresh token exists and is not blacklisted.
 *
 * @param userId - User ID
 * @param tokenId - JWT ID (jti claim)
 * @returns True if token is valid, false otherwise
 */
export async function isRefreshTokenValid(userId: string, tokenId: string): Promise<boolean> {
  const redis = getRedisClient();

  const blacklisted = await redis.exists(KEYS.blacklist(tokenId));
  if (blacklisted) {
    logger.debug({ tokenId }, 'Token is blacklisted');
    return false;
  }

  const exists = await redis.exists(KEYS.refreshToken(userId, tokenId));
  return exists === 1;
}

/**
 * Revokes a specific refresh token and adds it to the blacklist.
 *
 * @param userId - User ID
 * @param tokenId - JWT ID (jti claim)
 */
export async function revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
  const redis = getRedisClient();
  const env = getEnvConfig();
  const ttl = parseDuration(env.jwt.refreshExpiresIn);

  await redis.del(KEYS.refreshToken(userId, tokenId));
  await redis.set(KEYS.blacklist(tokenId), '1', 'EX', ttl);

  logger.debug({ userId, tokenId }, 'Refresh token revoked');
}

/**
 * Revokes all refresh tokens for a user (logout everywhere).
 * Uses SCAN instead of KEYS to avoid blocking Redis on large datasets.
 *
 * @param userId - User ID
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  const redis = getRedisClient();
  const pattern = KEYS.refreshToken(userId, '*');

  let deletedCount = 0;
  const stream = redis.scanStream({ match: pattern, count: 100 });

  await new Promise<void>((resolve, reject) => {
    stream.on('data', async (keys: string[]) => {
      if (keys.length > 0) {
        stream.pause();
        await redis.del(...keys);
        deletedCount += keys.length;
        stream.resume();
      }
    });
    stream.on('end', () => resolve());
    stream.on('error', (err) => reject(err));
  });

  if (deletedCount > 0) {
    logger.info({ userId, count: deletedCount }, 'All user tokens revoked');
  }
}
