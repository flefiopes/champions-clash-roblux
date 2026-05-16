/**
 * Character service.
 * Handles attribute upgrades, prestige, and idle collection logic.
 *
 * @module services/player/character
 */

import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDatabase } from '@/db';
import { players, transactions } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { AppError, AppErrorCode } from '@/lib/app-error';
import { updateQuestProgress } from '@/services/quest/quest.service';
import { getGameConfig } from '@/services/admin/admin-config.service';
import { invalidatePlayerByPlayerId } from '@/services/player/player.service';

/** Character service logger */
const logger = createChildLogger({ module: 'character-service' });

/**
 * Calculates and awards idle coin gains since the last collection.
 * Gains are based on time elapsed and the player's luck level.
 *
 * @param playerId - Internal player UUID
 * @returns Object with coins awarded and new total balance
 */
export async function collectIdleCoins(
  playerId: string
): Promise<{ awarded: number; newBalance: number }> {
  const db = getDatabase();
  const config = await getGameConfig();
  const now = new Date();

  const [player] = await db
    .select({
      coins: players.coins,
      luckLevel: players.luckLevel,
      idleLastCollectedAt: players.idleLastCollectedAt,
      createdAt: players.createdAt,
    })
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  if (!player) throw new AppError(AppErrorCode.PLAYER_NOT_FOUND, 'Player not found', 404);

  const lastCollected = player.idleLastCollectedAt || player.createdAt;
  const diffMs = now.getTime() - lastCollected.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Base rate: from config or default to 100. Max 24 hours of accumulation.
  const cappedHours = Math.min(diffHours, 24);
  const baseRate = (config.idleCoinBaseRate as number) || 100;
  const luckBonus = 1 + player.luckLevel * 0.1;
  const awarded = Math.floor(cappedHours * baseRate * luckBonus);

  if (awarded > 0) {
    await db
      .update(players)
      .set({
        coins: sql`${players.coins} + ${awarded}`,
        idleLastCollectedAt: now,
      })
      .where(eq(players.id, playerId));

    await db.insert(transactions).values({
      id: randomUUID(),
      playerId,
      type: 'idle_collect',
      amount: awarded,
      source: 'idle_builder',
      meta: { hours: cappedHours, luck_level: player.luckLevel },
    });

    // Track quest progress
    await updateQuestProgress(playerId, 'coins_earned', awarded);
  } else {
    // Just update the timestamp to prevent double-dipping if diff < 1s
    await db.update(players).set({ idleLastCollectedAt: now }).where(eq(players.id, playerId));
  }

  const newBalance = (player.coins ?? 0) + awarded;
  logger.info({ playerId, awarded, newBalance }, 'Idle coins collected');

  // Invalidate player profile cache
  await invalidatePlayerByPlayerId(playerId);

  return { awarded, newBalance };
}

/**
 * Upgrades a character attribute (force, speed, or luck).
 * Deducts coins based on a geometric cost curve.
 *
 * @param playerId - Internal player UUID
 * @param attribute - One of 'force', 'speed', 'luck'
 * @returns Object with the new level and remaining coin balance
 */
export async function upgradeAttribute(
  playerId: string,
  attribute: 'force' | 'speed' | 'luck'
): Promise<{ newLevel: number; newBalance: number }> {
  const db = getDatabase();

  const [player] = await db
    .select({
      coins: players.coins,
      forceLevel: players.forceLevel,
      speedLevel: players.speedLevel,
      luckLevel: players.luckLevel,
    })
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  if (!player) throw new AppError(AppErrorCode.PLAYER_NOT_FOUND, 'Player not found', 404);

  const currentLevel =
    attribute === 'force'
      ? player.forceLevel
      : attribute === 'speed'
        ? player.speedLevel
        : player.luckLevel;

  // Cost curve: Level 0->1 costs 200. Each level costs 2x previous approx.
  // We'll follow the plan's palier 1 costs: 200, 400, 800, 1500, 3000
  const costs = [200, 400, 800, 1500, 3000, 6000, 12000, 24000, 48000, 96000];
  const cost = currentLevel < costs.length ? costs[currentLevel] : 200000 * (currentLevel - 8);

  if ((player.coins ?? 0) < cost) {
    throw new AppError(AppErrorCode.INSUFFICIENT_COINS, 'Insufficient coins for upgrade', 400, {
      required: cost,
      current: player.coins,
    });
  }

  const newLevel = currentLevel + 1;

  // Use explicit mapping to avoid 'any'
  const setClause =
    attribute === 'force'
      ? { forceLevel: newLevel }
      : attribute === 'speed'
        ? { speedLevel: newLevel }
        : { luckLevel: newLevel };

  await db
    .update(players)
    .set({
      ...setClause,
      coins: sql`${players.coins} - ${cost}`,
    })
    .where(eq(players.id, playerId));

  await db.insert(transactions).values({
    id: randomUUID(),
    playerId,
    type: 'upgrade_buy',
    amount: cost,
    source: `upgrade_${attribute}`,
    meta: { old_level: currentLevel, new_level: newLevel },
  });

  const newBalance = (player.coins ?? 0) - cost;
  logger.info({ playerId, attribute, newLevel, cost }, 'Character attribute upgraded');

  // Invalidate player profile cache
  await invalidatePlayerByPlayerId(playerId);

  return { newLevel, newBalance };
}
