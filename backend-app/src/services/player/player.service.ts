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
import type { PlayerProfile, PlayerFactionSummary, PlayerRank } from '@/types';
import { cacheGet, cacheSet, cacheDelete } from '@/lib/cache';

/** Player service logger */
const logger = createChildLogger({ module: 'player-service' });

/** Maximum number of quiz attempts allowed per player per day */
const DAILY_QUIZ_LIMIT = 3;

/** Maximum idle collection operations per player per day */
const DAILY_IDLE_COLLECT_LIMIT = 1;

/** Cache keys and TTL */
const CACHE_KEYS = {
  PROFILE: (robloxId: number) => `player:profile:robloxId:${robloxId}`,
  ID_MAP: (playerId: string) => `player:map:id:${playerId}`,
};

const CACHE_TTL = 300; // 5 minutes

/**
 * Invalidates the cached profile of a player.
 *
 * @param robloxUserId - Roblox userId
 */
export async function invalidatePlayerCache(robloxUserId: number): Promise<void> {
  await cacheDelete(CACHE_KEYS.PROFILE(robloxUserId));
  logger.debug({ robloxUserId }, 'Player profile cache invalidated');
}

/**
 * Resolves a Roblox userId from an internal player UUID.
 * Uses a long-lived cache as this mapping never changes.
 *
 * @param playerId - Internal player UUID
 * @returns Roblox userId or null if not found
 */
export async function getRobloxId(playerId: string): Promise<number | null> {
  const cacheKey = CACHE_KEYS.ID_MAP(playerId);
  const cached = await cacheGet<number>(cacheKey);
  if (cached) return cached;

  const db = getDatabase();
  const rows = await db
    .select({ robloxUserId: players.robloxUserId })
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  if (rows.length === 0) return null;

  const robloxId = rows[0]!.robloxUserId;
  await cacheSet(cacheKey, robloxId, 86400 * 7); // 7 days cache for mapping
  return robloxId;
}

/**
 * Invalidates a player's profile cache using their internal playerId.
 *
 * @param playerId - Internal player UUID
 */
export async function invalidatePlayerByPlayerId(playerId: string): Promise<void> {
  const robloxId = await getRobloxId(playerId);
  if (robloxId) {
    await invalidatePlayerCache(robloxId);
  }
}

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
    .select({
      id: players.id,
      lastSeen: players.lastSeen,
      loginStreak: players.loginStreak,
      avgSessionHour: players.avgSessionHour,
    })
    .from(players)
    .where(eq(players.robloxUserId, robloxUserId))
    .limit(1);

  if (existing.length > 0) {
    const player = existing[0]!;
    const now = new Date();
    const lastSeen = player.lastSeen || new Date(0);
    const currentHour = now.getHours();

    // Weighted average for session hour (simplified to 7-day window)
    const oldAvg = player.avgSessionHour ?? currentHour;
    const newAvg = Math.round((oldAvg * 6 + currentHour) / 7);

    let newStreak = player.loginStreak;

    // Daily streak logic
    const msInDay = 24 * 60 * 60 * 1000;
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffDays = Math.floor(diffMs / msInDay);

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    await db
      .update(players)
      .set({
        username,
        lastSeen: now,
        loginStreak: newStreak,
        avgSessionHour: newAvg,
      })
      .where(eq(players.id, player.id));

    // Invalidate cache since username or login state changed
    await invalidatePlayerCache(robloxUserId);

    logger.debug(
      { robloxUserId, playerId: player.id, oldStreak: player.loginStreak, newStreak },
      'Player logged in (streak updated)'
    );
    return player.id;
  }

  const newId = randomUUID();

  await db.insert(players).values({
    id: newId,
    robloxUserId,
    username,
    loginStreak: 1,
    lastSeen: new Date(),
  });

  logger.info({ robloxUserId, playerId: newId }, 'New player created');
  return newId;
}

/**
 * Utility to calculate player level from total XP.
 * Formula: Level = floor(sqrt(XP / 100)) + 1
 */
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Utility to calculate total XP required to reach a specific level.
 * Formula: XP = (Level - 1)^2 * 100
 */
function calculateXpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

/**
 * Retrieves the full public profile of a player by their Roblox user ID.
 * Includes coins, gems, XP, rank, level, and all active faction memberships.
 *
 * @param robloxUserId - Roblox userId
 * @returns Full player profile
 * @throws AppError(PLAYER_NOT_FOUND) if no matching player exists
 */
export async function getProfile(robloxUserId: number): Promise<PlayerProfile> {
  // 1. Try cache first
  const cacheKey = CACHE_KEYS.PROFILE(robloxUserId);
  const cached = await cacheGet<PlayerProfile>(cacheKey);
  if (cached) {
    logger.debug({ robloxUserId }, 'Player profile cache hit');
    return cached;
  }

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

  const level = calculateLevel(player.xp);
  const nextLevelXp = calculateXpForLevel(level + 1);

  const profile: PlayerProfile = {
    id: player.id,
    robloxUserId: player.robloxUserId,
    username: player.username,
    coins: player.coins,
    gems: player.gems,
    xp: player.xp,
    rank: player.rank as PlayerRank,
    level,
    nextLevelXp,
    loginStreak: player.loginStreak,
    lastSeen: player.lastSeen,
    forceLevel: player.forceLevel,
    speedLevel: player.speedLevel,
    luckLevel: player.luckLevel,
    prestigeLevel: player.prestigeLevel,
    avgSessionHour: player.avgSessionHour,
    idleLastCollectedAt: player.idleLastCollectedAt,
    createdAt: player.createdAt,
    factions: factionList,
  };

  // 2. Save to cache
  await cacheSet(cacheKey, profile, CACHE_TTL);

  return profile;
}

/**
 * Returns the daily usage limits for rate-limited game actions.
 * Counts today's transactions from Redis to compute used vs allowed quotas.
 * Falls back to DB count if Redis is unavailable.
 *
 * @param robloxUserId - Roblox userId
 * @returns Daily limits object with used/max for each action type
 */
export function getDailyLimits(robloxUserId: number): {
  quiz: { used: number; max: number };
  idleCollect: { used: number; max: number };
} {
  // Placeholder: Phase 2 will add actual Redis counters per player per day.
  // For now, return maximum allowed values so Roblox clients are unblocked.
  logger.debug({ robloxUserId }, 'getDailyLimits called (using defaults until Phase 2)');

  return {
    quiz: { used: 0, max: DAILY_QUIZ_LIMIT },
    idleCollect: { used: 0, max: DAILY_IDLE_COLLECT_LIMIT },
  };
}
