/**
 * Player service.
 * Handles player account lifecycle: creation, profile retrieval, daily limits.
 * All Roblox-to-backend player interactions flow through this service.
 *
 * @module services/player
 */

import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDatabase } from '@/db';
import { players, playerFactions, factions, wars } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { AppError, AppErrorCode } from '@/lib/app-error';
import type { PlayerProfile, PlayerFactionSummary } from '@/types';

/** Player service logger */
const logger = createChildLogger({ module: 'player-service' });

/** Maximum number of quiz attempts allowed per player per day */
const DAILY_QUIZ_LIMIT = 3;

/** Maximum idle collection operations per player per day */
const DAILY_IDLE_COLLECT_LIMIT = 1;

/**
 * Upserts a player record on login.
 * Creates a new player if the roblox_user_id is not yet known, otherwise updates the username and last_seen.
 *
 * @param robloxUserId - Roblox userId
 * @param username - Current Roblox display name
 * @returns The player's internal UUID
 */
export async function loginOrCreate(robloxUserId: number, username: string): Promise<string> {
  const db = getDatabase();

  const existing = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.robloxUserId, robloxUserId))
    .limit(1);

  if (existing.length > 0) {
    // Update last_seen and sync username on every login
    await db
      .update(players)
      .set({ username, lastSeen: new Date() })
      .where(eq(players.robloxUserId, robloxUserId));

    logger.debug({ robloxUserId, playerId: existing[0]!.id }, 'Player logged in');
    return existing[0]!.id;
  }

  const newId = randomUUID();

  await db.insert(players).values({
    id: newId,
    robloxUserId,
    username,
    lastSeen: new Date(),
  });

  logger.info({ robloxUserId, playerId: newId }, 'New player created');
  return newId;
}

/**
 * Retrieves the full public profile of a player by their Roblox user ID.
 * Includes coins, gems, XP, rank, and all active faction memberships.
 *
 * @param robloxUserId - Roblox userId
 * @returns Full player profile
 * @throws AppError(PLAYER_NOT_FOUND) if no matching player exists
 */
export async function getProfile(robloxUserId: number): Promise<PlayerProfile> {
  const db = getDatabase();

  const playerRows = await db
    .select()
    .from(players)
    .where(eq(players.robloxUserId, robloxUserId))
    .limit(1);

  if (playerRows.length === 0) {
    throw new AppError(AppErrorCode.PLAYER_NOT_FOUND, 'Player not found', 404, {
      robloxUserId,
    });
  }

  const player = playerRows[0]!;

  // Fetch faction memberships with faction and war names joined
  const membershipRows = await db
    .select({
      factionId: playerFactions.factionId,
      factionName: factions.name,
      warId: playerFactions.warId,
      warName: wars.name,
      weeklyPoints: playerFactions.weeklyPoints,
      alltimePoints: playerFactions.alltimePoints,
      joinedAt: playerFactions.joinedAt,
    })
    .from(playerFactions)
    .innerJoin(factions, eq(playerFactions.factionId, factions.id))
    .innerJoin(wars, eq(playerFactions.warId, wars.id))
    .where(eq(playerFactions.playerId, player.id));

  const factionList: PlayerFactionSummary[] = membershipRows.map((row) => ({
    factionId: row.factionId,
    factionName: row.factionName,
    warId: row.warId,
    warName: row.warName,
    weeklyPoints: row.weeklyPoints,
    alltimePoints: row.alltimePoints,
    joinedAt: row.joinedAt,
  }));

  return {
    id: player.id,
    robloxUserId: player.robloxUserId,
    username: player.username,
    coins: player.coins,
    gems: player.gems,
    xp: player.xp,
    rank: player.rank,
    loginStreak: player.loginStreak,
    lastSeen: player.lastSeen,
    createdAt: player.createdAt,
    factions: factionList,
  };
}

/**
 * Returns the daily usage limits for rate-limited game actions.
 * Counts today's transactions from Redis to compute used vs allowed quotas.
 * Falls back to DB count if Redis is unavailable.
 *
 * @param robloxUserId - Roblox userId
 * @returns Daily limits object with used/max for each action type
 */
export function getDailyLimits(
  robloxUserId: number
): { quiz: { used: number; max: number }; idleCollect: { used: number; max: number } } {
  // Placeholder: Phase 2 will add actual Redis counters per player per day.
  // For now, return maximum allowed values so Roblox clients are unblocked.
  logger.debug({ robloxUserId }, 'getDailyLimits called (using defaults until Phase 2)');

  return {
    quiz: { used: 0, max: DAILY_QUIZ_LIMIT },
    idleCollect: { used: 0, max: DAILY_IDLE_COLLECT_LIMIT },
  };
}
