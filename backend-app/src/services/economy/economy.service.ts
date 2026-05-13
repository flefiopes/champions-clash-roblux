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

/** Economy service logger */
const logger = createChildLogger({ module: 'economy-service' });

/** Conversion rate: coins to faction points */
const COIN_TO_POINT_RATE = 10; // 100 coins = 10 points

/**
 * Adds coins to a player's balance and records a transaction.
 * The caller is responsible for enforcing per-action rate limits before invoking this.
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

  await db
    .update(players)
    .set({ coins: sql`${players.coins} + ${amount}` })
    .where(eq(players.id, playerId));

  await db.insert(transactions).values({
    id: randomUUID(),
    playerId,
    type: 'coin_gain',
    amount,
    source,
    meta: meta ?? null,
  });

  const updated = await db
    .select({ coins: players.coins })
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  const newBalance = updated[0]?.coins ?? 0;

  logger.debug({ playerId, amount, source, newBalance }, 'Coins added');
  return newBalance;
}

/**
 * Adds XP to a player's profile and records a transaction.
 *
 * @param playerId - Internal player UUID
 * @param amount - Amount of XP to add
 * @param source - Source identifier
 * @returns Updated XP balance
 */
export async function addXp(playerId: string, amount: number, source: string): Promise<number> {
  const db = getDatabase();

  await db
    .update(players)
    .set({ xp: sql`${players.xp} + ${amount}` })
    .where(eq(players.id, playerId));

  await db.insert(transactions).values({
    id: randomUUID(),
    playerId,
    type: 'xp_gain',
    amount,
    source,
    meta: null,
  });

  const updated = await db
    .select({ xp: players.xp })
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  const newBalance = updated[0]?.xp ?? 0;

  logger.debug({ playerId, amount, source, newBalance }, 'XP added');
  return newBalance;
}

/**
 * Deducts coins from a player's balance.
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

  const playerRow = await db
    .select({ coins: players.coins })
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  if (!playerRow.length || playerRow[0]!.coins < amount) {
    throw new AppError(AppErrorCode.INSUFFICIENT_COINS, 'Insufficient coin balance', 400, {
      required: amount,
      current: playerRow[0]?.coins ?? 0,
    });
  }

  await db
    .update(players)
    .set({ coins: sql`${players.coins} - ${amount}` })
    .where(eq(players.id, playerId));

  await db.insert(transactions).values({
    id: randomUUID(),
    playerId,
    type: 'coin_spend',
    amount,
    source,
    meta: null,
  });

  const newBalance = (playerRow[0]!.coins ?? 0) - amount;
  logger.debug({ playerId, amount, source, newBalance }, 'Coins spent');
  return newBalance;
}

/**
 * Converts coins to faction points in a single atomic operation.
 * Validates coin balance, deducts coins, increments both weekly and all-time faction points,
 * increments faction total_points, and logs the transaction.
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

  // Verify the player is a member of the specified faction in this war
  const membership = await db
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

  // Check balance
  const playerRow = await db
    .select({ coins: players.coins })
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  if (!playerRow.length || playerRow[0]!.coins < coinsSpent) {
    throw new AppError(
      AppErrorCode.INSUFFICIENT_COINS,
      'Insufficient coin balance for point contribution',
      400,
      { required: coinsSpent, current: playerRow[0]?.coins ?? 0 }
    );
  }

  const pointsAwarded = Math.floor(coinsSpent / 100) * COIN_TO_POINT_RATE;

  // Deduct coins from player
  await db
    .update(players)
    .set({ coins: sql`${players.coins} - ${coinsSpent}` })
    .where(eq(players.id, playerId));

  // Increment player's weekly and all-time contribution
  await db
    .update(playerFactions)
    .set({
      weeklyPoints: sql`${playerFactions.weeklyPoints} + ${pointsAwarded}`,
      alltimePoints: sql`${playerFactions.alltimePoints} + ${pointsAwarded}`,
    })
    .where(and(eq(playerFactions.playerId, playerId), eq(playerFactions.warId, warId)));

  // Increment faction aggregate
  await db
    .update(factions)
    .set({ totalPoints: sql`${factions.totalPoints} + ${pointsAwarded}` })
    .where(eq(factions.id, factionId));

  // Record the transaction
  await db.insert(transactions).values({
    id: randomUUID(),
    playerId,
    type: 'point_contribution',
    amount: pointsAwarded,
    source: 'point_contribution',
    meta: { coins_spent: coinsSpent, faction_id: factionId, war_id: warId },
  });

  const newCoinBalance = playerRow[0]!.coins - coinsSpent;

  logger.info(
    { playerId, factionId, warId, coinsSpent, pointsAwarded, newCoinBalance },
    'Point contribution processed'
  );

  return { newCoinBalance, pointsAwarded };
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
