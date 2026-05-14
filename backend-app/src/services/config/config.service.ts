/**
 * Config service.
 * Assembles the public game configuration snapshot polled by Roblox clients every 5 minutes.
 * Values are read from the game_config table and merged with safe defaults.
 * Cached in Redis for 60 seconds to avoid DB hits on every Roblox server poll.
 *
 * @module services/config
 */

import { getDatabase } from '@/db';
import { gameConfig } from '@/db/schema';
import { getRedisClient } from '@/lib/redis';
import { createChildLogger } from '@/lib/logger';
import type { PublicGameConfig } from '@/types';

/** Config service logger */
const logger = createChildLogger({ module: 'config-service' });

/** Redis cache key for the public config snapshot */
const CONFIG_CACHE_KEY = 'game:public_config';

/** Cache TTL in seconds — Roblox polls every 5 minutes, so 60s is a safe balance */
const CACHE_TTL_SECONDS = 60;

/**
 * Default configuration returned when no DB rows override the values.
 * Represents the safest, most conservative settings for an MVP launch.
 */
const DEFAULT_CONFIG: PublicGameConfig = {
  minigames: {
    race: { enabled: true, max_reward: 300 },
    combat: { enabled: true, max_reward: 500 },
    idle: { enabled: false, max_reward: 100 },
    quiz: { enabled: false, max_reward: 200 },
    platformer: { enabled: false, max_reward: 400 },
  },
  globalMultiplier: 1.0,
  doublePointsWeekend: false,
  maxWarsPerPlayer: 1,
  coinToPointRate: 10,
};

/**
 * Returns the public game configuration snapshot.
 * Checks Redis cache first; on miss, queries the DB and rebuilds the snapshot.
 * Individual DB keys override the defaults without replacing the entire object.
 *
 * @returns Assembled public config object
 */
export async function getPublicConfig(): Promise<PublicGameConfig> {
  const redis = getRedisClient();

  // Attempt cache hit
  try {
    const cached = await redis.get(CONFIG_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as PublicGameConfig;
    }
  } catch (err) {
    // Redis failure is non-fatal — fall through to DB
    logger.warn({ err }, 'Redis cache read failed for public config');
  }

  const db = getDatabase();
  const rows = await db.select().from(gameConfig);

  // Build a key→value map from DB rows
  const dbConfig = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  // Merge DB overrides on top of defaults
  const config: PublicGameConfig = {
    minigames: {
      ...DEFAULT_CONFIG.minigames,
      ...(typeof dbConfig.minigames === 'object' && dbConfig.minigames !== null
        ? (dbConfig.minigames as PublicGameConfig['minigames'])
        : {}),
    },
    globalMultiplier:
      typeof dbConfig.global_multiplier === 'number'
        ? dbConfig.global_multiplier
        : DEFAULT_CONFIG.globalMultiplier,
    doublePointsWeekend:
      typeof dbConfig.double_points_weekend === 'boolean'
        ? dbConfig.double_points_weekend
        : DEFAULT_CONFIG.doublePointsWeekend,
    maxWarsPerPlayer:
      typeof dbConfig.max_wars_per_player === 'number'
        ? dbConfig.max_wars_per_player
        : DEFAULT_CONFIG.maxWarsPerPlayer,
    coinToPointRate:
      typeof dbConfig.coin_to_point_rate === 'number'
        ? dbConfig.coin_to_point_rate
        : DEFAULT_CONFIG.coinToPointRate,
  };

  // Populate cache
  try {
    await redis.set(CONFIG_CACHE_KEY, JSON.stringify(config), 'EX', CACHE_TTL_SECONDS);
  } catch (err) {
    logger.warn({ err }, 'Redis cache write failed for public config');
  }

  logger.debug('Public config assembled from DB');
  return config;
}

/**
 * Invalidates the cached public config.
 * Call this after any admin update to a game_config key so the next poll
 * reflects the new value immediately.
 */
export async function invalidateConfigCache(): Promise<void> {
  const redis = getRedisClient();
  try {
    await redis.del(CONFIG_CACHE_KEY);
    logger.debug('Public config cache invalidated');
  } catch (err) {
    logger.warn({ err }, 'Failed to invalidate public config cache');
  }
}
