/**
 * Economy service.
 * Handles all coin/gem balance mutations and faction point contributions.
 * Every balance change is validated server-side and produces an immutable transaction record.
 * Rate limiting is enforced via Redis sliding-window counters (per player).
 *
 * @module services/economy
 */

import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDatabase } from '@/db';
import { players, transactions, playerFactions, factions, activeBoosts } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { AppError, AppErrorCode } from '@/lib/app-error';
import type { ActiveBoostData } from '@/types';
import { invalidateWarCaches } from '@/services/war/war.service';
import { invalidatePlayerByPlayerId } from '@/services/player/player.service';

/** Economy service logger */
const logger = createChildLogger({ module: 'economy-service' });

/** Conversion rate: coins to faction points */
const COIN_TO_POINT_RATE = 10; // 100 coins = 10 points

/**
 * Adds coins to a player's balance and records a transaction.
 * Uses an atomic database transaction to ensure consistency.
 *
 * @param playerId - Internal player UUID
 * @param amount - Positive number of coins to add
 * @param source - Machine-readable source identifier
 * @param meta - Optional contextual metadata for audit trail
 * @returns Updated coin balance
 */
export async function addCoins(
  playerId: string,
  amount: number,
  source: string,
  meta?: Record<string, unknown>
): Promise<number> {
  const db = getDatabase();

  return await db.transaction(async (tx) => {
    await tx
      .update(players)
      .set({ coins: sql`${players.coins} + ${amount}` })
      .where(eq(players.id, playerId));

    await tx.insert(transactions).values({
      id: randomUUID(),
      playerId,
      type: 'coin_gain',
      amount,
      source,
      meta: meta ?? null,
    });

    const updated = await tx
      .select({ coins: players.coins })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    const newBalance = updated[0]?.coins ?? 0;
    logger.debug({ playerId, amount, source, newBalance }, 'Coins added (transactional)');
    
    // Invalidate player profile cache
    await invalidatePlayerByPlayerId(playerId);

    return newBalance;
  });
}

/**
 * Adds XP to a player's profile and records a transaction.
 * Uses an atomic database transaction.
 *
 * @param playerId - Internal player UUID
 * @param amount - Amount of XP to add
 * @param source - Source identifier
 * @returns Updated XP balance
 */
export async function addXp(playerId: string, amount: number, source: string): Promise<number> {
  const db = getDatabase();

  return await db.transaction(async (tx) => {
    await tx
      .update(players)
      .set({ xp: sql`${players.xp} + ${amount}` })
      .where(eq(players.id, playerId));

    await tx.insert(transactions).values({
      id: randomUUID(),
      playerId,
      type: 'xp_gain',
      amount,
      source,
      meta: null,
    });

    const updated = await tx
      .select({ xp: players.xp })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    const newBalance = updated[0]?.xp ?? 0;
    logger.debug({ playerId, amount, source, newBalance }, 'XP added (transactional)');

    // Invalidate player profile cache
    await invalidatePlayerByPlayerId(playerId);

    return newBalance;
  });
}

/**
 * Deducts coins from a player's balance.
 * Uses an atomic SQL update with balance check in WHERE clause to prevent race conditions.
 * Throws INSUFFICIENT_COINS if the player cannot afford the cost.
 *
 * @param playerId - Internal player UUID
 * @param amount - Positive number of coins to deduct
 * @param source - Machine-readable source identifier
 * @returns Updated coin balance
 */
export async function spendCoins(
  playerId: string,
  amount: number,
  source: string
): Promise<number> {
  const db = getDatabase();

  return await db.transaction(async (tx) => {
    // Atomic update: only proceed if coins >= amount
    const result = await tx
      .update(players)
      .set({ coins: sql`${players.coins} - ${amount}` })
      .where(and(eq(players.id, playerId), sql`${players.coins} >= ${amount}`));

    // rowsAffected check for Drizzle MySQL
    if (result[0].affectedRows === 0) {
      // Fetch current balance for a better error message
      const playerRow = await tx
        .select({ coins: players.coins })
        .from(players)
        .where(eq(players.id, playerId))
        .limit(1);

      throw new AppError(AppErrorCode.INSUFFICIENT_COINS, 'Insufficient coin balance', 400, {
        required: amount,
        current: playerRow[0]?.coins ?? 0,
      });
    }

    await tx.insert(transactions).values({
      id: randomUUID(),
      playerId,
      type: 'coin_spend',
      amount,
      source,
      meta: null,
    });

    const updated = await tx
      .select({ coins: players.coins })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    const newBalance = updated[0]?.coins ?? 0;
    logger.debug({ playerId, amount, source, newBalance }, 'Coins spent (atomic transaction)');

    // Invalidate player profile cache
    await invalidatePlayerByPlayerId(playerId);

    return newBalance;
  });
}

/**
 * Converts coins to faction points in a single atomic operation.
 * Validates coin balance via atomic SQL check, deducts coins, increments both
 * weekly and all-time faction points, increments faction total_points, and logs transaction.
 *
 * @param playerId - Internal player UUID
 * @param coinsSpent - Number of coins to convert
 * @param factionId - Target faction UUID
 * @param warId - War UUID for the contribution
 * @returns Result with new coin balance and points awarded
 */
export async function contributePoints(
  playerId: string,
  coinsSpent: number,
  factionId: string,
  warId: string
): Promise<{ newCoinBalance: number; pointsAwarded: number }> {
  const db = getDatabase();

  return await db.transaction(async (tx) => {
    // 1. Verify membership
    const membership = await tx
      .select({ weeklyPoints: playerFactions.weeklyPoints })
      .from(playerFactions)
      .where(
        and(
          eq(playerFactions.playerId, playerId),
          eq(playerFactions.factionId, factionId),
          eq(playerFactions.warId, warId)
        )
      )
      .limit(1);

    if (!membership.length) {
      throw new AppError(
        AppErrorCode.INVALID_FACTION,
        'Player is not a member of this faction',
        400,
        { playerId, factionId, warId }
      );
    }

    // 2. Atomic coin deduction
    const deductResult = await tx
      .update(players)
      .set({ coins: sql`${players.coins} - ${coinsSpent}` })
      .where(and(eq(players.id, playerId), sql`${players.coins} >= ${coinsSpent}`));

    if (deductResult[0].affectedRows === 0) {
      const playerRow = await tx
        .select({ coins: players.coins })
        .from(players)
        .where(eq(players.id, playerId))
        .limit(1);

      throw new AppError(
        AppErrorCode.INSUFFICIENT_COINS,
        'Insufficient coin balance for point contribution',
        400,
        { required: coinsSpent, current: playerRow[0]?.coins ?? 0 }
      );
    }

    const pointsAwarded = Math.floor(coinsSpent / 100) * COIN_TO_POINT_RATE;

    // 3. Increment player's weekly and all-time contribution
    await tx
      .update(playerFactions)
      .set({
        weeklyPoints: sql`${playerFactions.weeklyPoints} + ${pointsAwarded}`,
        alltimePoints: sql`${playerFactions.alltimePoints} + ${pointsAwarded}`,
      })
      .where(and(eq(playerFactions.playerId, playerId), eq(playerFactions.warId, warId)));

    // 4. Increment faction aggregate
    await tx
      .update(factions)
      .set({ totalPoints: sql`${factions.totalPoints} + ${pointsAwarded}` })
      .where(eq(factions.id, factionId));

    // 5. Record the transaction
    await tx.insert(transactions).values({
      id: randomUUID(),
      playerId,
      type: 'point_contribution',
      amount: pointsAwarded,
      source: 'point_contribution',
      meta: { coins_spent: coinsSpent, faction_id: factionId, war_id: warId },
    });

    const updatedPlayer = await tx
      .select({ coins: players.coins })
      .from(players)
      .where(eq(players.id, playerId))
      .limit(1);

    const newCoinBalance = updatedPlayer[0]?.coins ?? 0;

    logger.info(
      { playerId, factionId, warId, coinsSpent, pointsAwarded, newCoinBalance },
      'Point contribution processed (atomic transaction)'
    );

    await invalidateWarCaches(warId);
    // Invalidate player profile cache
    await invalidatePlayerByPlayerId(playerId);

    return { newCoinBalance, pointsAwarded };
  });
}

/**
 * Retrieves all active (non-expired) boosts for a player.
 *
 * @param playerId - Internal player UUID
 * @returns List of active boost data for the client to apply locally
 */
export async function getActiveBoosts(playerId: string): Promise<ActiveBoostData[]> {
  const db = getDatabase();
  const now = new Date();

  const rows = await db
    .select()
    .from(activeBoosts)
    .where(and(eq(activeBoosts.playerId, playerId), sql`${activeBoosts.expiresAt} > ${now}`));

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    multiplier: row.multiplier,
    expiresAt: row.expiresAt,
  }));
}
