/**
 * War service.
 * Handles war and faction lifecycle: active war listing, leaderboards,
 * faction membership (with 7-day lock), and the weekly score reset pipeline.
 *
 * @module services/war
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDatabase } from '@/db';
import { wars, factions, players, playerFactions, warWeeklyResults } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { AppError, AppErrorCode } from '@/lib/app-error';
import type { ActiveWar, FactionScore, WarLeaderboard, LeaderboardEntry } from '@/types';

/** War service logger */
const logger = createChildLogger({ module: 'war-service' });

/** Duration of the faction lock after joining (7 days in ms) */
const FACTION_LOCK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns all active wars with their factions and current scores.
 * Used by the Roblox client for the faction selection screen and HUD.
 *
 * @returns List of active wars with faction details
 */
export async function getActiveWars(): Promise<ActiveWar[]> {
  const db = getDatabase();

  const warRows = await db.select().from(wars).where(eq(wars.status, 'active'));

  if (warRows.length === 0) return [];

  const warIds = warRows.map((w) => w.id);

  // Fetch factions for all active wars with member counts
  const factionRows = await db
    .select({
      id: factions.id,
      warId: factions.warId,
      name: factions.name,
      colorHex: factions.colorHex,
      slogan: factions.slogan,
      totalPoints: factions.totalPoints,
      memberCount: sql<number>`COUNT(${playerFactions.playerId})`,
    })
    .from(factions)
    .leftJoin(
      playerFactions,
      and(eq(playerFactions.factionId, factions.id), eq(playerFactions.warId, factions.warId))
    )
    .where(
      sql`${factions.warId} IN (${sql.join(
        warIds.map((id) => sql`${id}`),
        sql`, `
      )})`
    )
    .groupBy(factions.id);

  const factionsByWar = new Map<string, FactionScore[]>();
  for (const f of factionRows) {
    if (!factionsByWar.has(f.warId)) {
      factionsByWar.set(f.warId, []);
    }
    factionsByWar.get(f.warId)!.push({
      id: f.id,
      warId: f.warId,
      name: f.name,
      colorHex: f.colorHex,
      slogan: f.slogan,
      totalPoints: f.totalPoints,
      memberCount: f.memberCount,
    });
  }

  return warRows.map((war) => ({
    id: war.id,
    name: war.name,
    status: war.status,
    resetWeekly: war.resetWeekly,
    lastResetAt: war.lastResetAt,
    endsAt: war.endsAt,
    factions: factionsByWar.get(war.id) ?? [],
  }));
}

/**
 * Returns the leaderboard for a specific war, grouped by faction.
 * Players are ranked by weekly_points descending within each faction.
 *
 * @param warId - War UUID
 * @param limit - Maximum entries per faction (default 100)
 * @returns War leaderboard grouped by faction
 * @throws AppError(WAR_NOT_FOUND) if the war does not exist
 */
export async function getLeaderboard(warId: string, limit = 100): Promise<WarLeaderboard> {
  const db = getDatabase();

  const warRows = await db
    .select({ id: wars.id, name: wars.name })
    .from(wars)
    .where(eq(wars.id, warId))
    .limit(1);

  if (!warRows.length) {
    throw new AppError(AppErrorCode.WAR_NOT_FOUND, 'War not found', 404, { warId });
  }

  const war = warRows[0]!;

  const factionRows = await db
    .select({ id: factions.id, name: factions.name })
    .from(factions)
    .where(eq(factions.warId, warId));

  const result: WarLeaderboard = {
    warId: war.id,
    warName: war.name,
    factions: [],
  };

  for (const faction of factionRows) {
    const entries = await db
      .select({
        playerId: playerFactions.playerId,
        robloxUserId: players.robloxUserId,
        username: players.username,
        weeklyPoints: playerFactions.weeklyPoints,
        alltimePoints: playerFactions.alltimePoints,
        playerRank: players.rank,
      })
      .from(playerFactions)
      .innerJoin(players, eq(playerFactions.playerId, players.id))
      .where(and(eq(playerFactions.factionId, faction.id), eq(playerFactions.warId, warId)))
      .orderBy(desc(playerFactions.weeklyPoints))
      .limit(limit);

    const ranked: LeaderboardEntry[] = entries.map((e, idx) => ({
      rank: idx + 1,
      playerId: e.playerId,
      robloxUserId: e.robloxUserId,
      username: e.username,
      weeklyPoints: e.weeklyPoints,
      alltimePoints: e.alltimePoints,
      playerRank: e.playerRank,
    }));

    result.factions.push({ factionId: faction.id, factionName: faction.name, entries: ranked });
  }

  return result;
}

/**
 * Assigns a player to a faction within a war.
 * Enforces the 7-day lock: a player who already has a membership must wait before switching.
 *
 * @param playerId - Internal player UUID
 * @param factionId - Target faction UUID
 * @param warId - War UUID
 * @throws AppError(WAR_NOT_FOUND) if war doesn't exist
 * @throws AppError(FACTION_NOT_FOUND) if faction doesn't exist or doesn't belong to the war
 * @throws AppError(FACTION_LOCK_ACTIVE) if the player is locked in another faction
 */
export async function joinFaction(
  playerId: string,
  factionId: string,
  warId: string
): Promise<void> {
  const db = getDatabase();

  // Validate war
  const warRows = await db.select({ id: wars.id }).from(wars).where(eq(wars.id, warId)).limit(1);
  if (!warRows.length) {
    throw new AppError(AppErrorCode.WAR_NOT_FOUND, 'War not found', 404, { warId });
  }

  // Validate faction belongs to this war
  const factionRows = await db
    .select({ id: factions.id })
    .from(factions)
    .where(and(eq(factions.id, factionId), eq(factions.warId, warId)))
    .limit(1);

  if (!factionRows.length) {
    throw new AppError(AppErrorCode.FACTION_NOT_FOUND, 'Faction not found in this war', 404, {
      factionId,
      warId,
    });
  }

  // Check existing membership
  const existing = await db
    .select({ factionId: playerFactions.factionId, joinedAt: playerFactions.joinedAt })
    .from(playerFactions)
    .where(and(eq(playerFactions.playerId, playerId), eq(playerFactions.warId, warId)))
    .limit(1);

  if (existing.length > 0) {
    const lockExpiresAt = existing[0]!.joinedAt.getTime() + FACTION_LOCK_MS;
    if (Date.now() < lockExpiresAt) {
      throw new AppError(
        AppErrorCode.FACTION_LOCK_ACTIVE,
        'You cannot change faction yet. The 7-day lock is still active.',
        409,
        { lockExpiresAt: new Date(lockExpiresAt).toISOString() }
      );
    }

    // Lock expired — allow faction switch
    await db
      .update(playerFactions)
      .set({ factionId, joinedAt: new Date(), weeklyPoints: 0 })
      .where(and(eq(playerFactions.playerId, playerId), eq(playerFactions.warId, warId)));

    logger.info({ playerId, factionId, warId }, 'Player switched faction after lock expiry');
    return;
  }

  // New membership
  await db.insert(playerFactions).values({
    playerId,
    factionId,
    warId,
    joinedAt: new Date(),
  });

  logger.info({ playerId, factionId, warId }, 'Player joined faction');
}

/**
 * Executes the weekly war reset for a single war.
 * 1. Snapshots the current top contributors into war_weekly_results.
 * 2. Determines the winning faction by weekly_points.
 * 3. Resets all player weekly_points to 0.
 * 4. Updates wars.last_reset_at.
 *
 * This is called exclusively by the weekly-war-reset cron job.
 *
 * @param warId - War UUID to reset
 * @returns The winning faction ID for this week
 */
export async function performWeeklyReset(warId: string): Promise<string> {
  const db = getDatabase();

  logger.info({ warId }, 'Starting weekly war reset');

  // Fetch the top 50 contributors per faction for snapshot
  const factionRows = await db
    .select({ id: factions.id })
    .from(factions)
    .where(eq(factions.warId, warId));

  let winnerFactionId = '';
  let topPoints = -1;

  const snapshot: Array<{
    playerId: string;
    username: string;
    weeklyPoints: number;
    factionId: string;
  }> = [];

  for (const faction of factionRows) {
    const contributors = await db
      .select({
        playerId: playerFactions.playerId,
        username: players.username,
        weeklyPoints: playerFactions.weeklyPoints,
      })
      .from(playerFactions)
      .innerJoin(players, eq(playerFactions.playerId, players.id))
      .where(and(eq(playerFactions.factionId, faction.id), eq(playerFactions.warId, warId)))
      .orderBy(desc(playerFactions.weeklyPoints))
      .limit(50);

    const totalWeekly = contributors.reduce((acc, c) => acc + c.weeklyPoints, 0);

    if (totalWeekly > topPoints) {
      topPoints = totalWeekly;
      winnerFactionId = faction.id;
    }

    for (const c of contributors) {
      snapshot.push({
        playerId: c.playerId,
        username: c.username,
        weeklyPoints: c.weeklyPoints,
        factionId: faction.id,
      });
    }
  }

  if (!winnerFactionId) {
    logger.warn({ warId }, 'No factions found for weekly reset — skipping');
    return '';
  }

  // Compute the Monday date for this week
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - daysToMonday);
  weekStart.setUTCHours(0, 0, 0, 0);

  // Persist the snapshot
  await db.insert(warWeeklyResults).values({
    id: randomUUID(),
    warId,
    weekStart,
    winnerFactionId,
    snapshot,
  });

  // Reset weekly points for all players in this war
  await db.update(playerFactions).set({ weeklyPoints: 0 }).where(eq(playerFactions.warId, warId));

  // Update last_reset_at
  await db.update(wars).set({ lastResetAt: new Date() }).where(eq(wars.id, warId));

  logger.info(
    { warId, winnerFactionId, snapshotSize: snapshot.length },
    'Weekly war reset completed'
  );
  return winnerFactionId;
}
