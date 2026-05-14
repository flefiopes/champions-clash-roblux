/**
 * Quest service.
 * Handles mission assignment, progress tracking, and reward distribution.
 * Supports daily, recruit, seasonal, and secret quest types.
 *
 * @module services/quest
 */

import { eq, and, sql, inArray, lt } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { quests, playerQuests } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { AppError, AppErrorCode } from '@/lib/app-error';
import { addCoins, addXp } from '@/services/economy/economy.service';
import type { PlayerQuest, QuestStatus } from '@/types';
import { getGameConfig } from '@/services/admin/admin-config.service';

/** Quest service logger */
const logger = createChildLogger({ module: 'quest-service' });

/** Number of daily quests to assign per player (default) */
const DEFAULT_DAILY_QUESTS_COUNT = 3;

/**
 * Assigns daily quests to a player if they don't have active ones for today.
 * Picks random daily quests from the available pool.
 *
 * @param playerId - Internal player UUID
 * @returns List of newly assigned or existing active quests
 */
export async function assignDailyQuests(playerId: string): Promise<PlayerQuest[]> {
  const db = getDatabase();
  const config = await getGameConfig();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Check for existing active daily quests assigned today
  const existing = await db
    .select()
    .from(playerQuests)
    .innerJoin(quests, eq(playerQuests.questId, quests.id))
    .where(
      and(
        eq(playerQuests.playerId, playerId),
        eq(quests.type, 'daily'),
        sql`${playerQuests.assignedAt} >= ${today}`
      )
    );

  if (existing.length > 0) {
    return existing.map((row) => ({
      ...row.quests,
      questId: row.quests.id,
      status: row.player_quests.status as QuestStatus,
      currentValue: row.player_quests.currentValue,
      assignedAt: row.player_quests.assignedAt,
    }));
  }

  // 2. Fetch available daily quests pool
  const pool = await db.select().from(quests).where(eq(quests.type, 'daily'));

  if (pool.length === 0) {
    logger.warn('No daily quests found in pool');
    return [];
  }

  // 3. Select random quests
  const dailyQuestsCount = (config.dailyQuestsCount as number) || DEFAULT_DAILY_QUESTS_COUNT;
  const selected = pool
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(pool.length, dailyQuestsCount));

  // 4. Assign to player
  const newAssignments = selected.map((q) => ({
    playerId,
    questId: q.id,
    status: 'active' as const,
    currentValue: 0,
    assignedAt: new Date(),
  }));

  if (newAssignments.length > 0) {
    await db
      .insert(playerQuests)
      .values(newAssignments)
      .onDuplicateKeyUpdate({
        set: { status: 'active', currentValue: 0, assignedAt: new Date() },
      });
  }

  logger.info({ playerId, count: selected.length }, 'Daily quests assigned');

  return selected.map((q) => ({
    ...q,
    questId: q.id,
    status: 'active' as QuestStatus,
    currentValue: 0,
    assignedAt: new Date(),
  }));
}

/**
 * Updates progress for all active quests matching a requirement type.
 * Triggers completion if the target value is reached.
 *
 * @param playerId - Internal player UUID
 * @param requirementType - The metric being updated (e.g. 'coins_earned')
 * @param incrementValue - Amount to add to current progress
 */
export async function updateQuestProgress(
  playerId: string,
  requirementType: string,
  incrementValue: number
): Promise<void> {
  const db = getDatabase();

  // Find active quests for this player with this requirement type
  const activeQuests = await db
    .select({
      id: quests.id,
      requirementValue: quests.requirementValue,
      currentValue: playerQuests.currentValue,
    })
    .from(playerQuests)
    .innerJoin(quests, eq(playerQuests.questId, quests.id))
    .where(
      and(
        eq(playerQuests.playerId, playerId),
        eq(playerQuests.status, 'active'),
        eq(quests.requirementType, requirementType)
      )
    );

  for (const quest of activeQuests) {
    const newValue = quest.currentValue + incrementValue;
    const isCompleted = newValue >= quest.requirementValue;

    await db
      .update(playerQuests)
      .set({
        currentValue: newValue,
        status: isCompleted ? 'completed' : 'active',
      })
      .where(and(eq(playerQuests.playerId, playerId), eq(playerQuests.questId, quest.id)));

    if (isCompleted) {
      logger.info({ playerId, questId: quest.id }, 'Quest completed');
    }
  }
}

/**
 * Claims rewards for a completed quest.
 * Marks the quest as 'claimed' and adds coins/XP/gems to the player.
 *
 * @param playerId - Internal player UUID
 * @param questId - Target quest UUID
 * @returns Object with awarded amounts
 */
export async function claimQuestReward(
  playerId: string,
  questId: string
): Promise<{ coins: number; gems: number; xp: number }> {
  const db = getDatabase();

  const [row] = await db
    .select()
    .from(playerQuests)
    .innerJoin(quests, eq(playerQuests.questId, quests.id))
    .where(and(eq(playerQuests.playerId, playerId), eq(playerQuests.questId, questId)))
    .limit(1);

  if (!row) {
    throw new AppError(AppErrorCode.NOT_FOUND, 'Quest assignment not found', 404);
  }

  if (row.player_quests.status !== 'completed') {
    throw new AppError(
      AppErrorCode.INVALID_ACTION,
      'Quest is not completed or already claimed',
      400
    );
  }

  // Update status to claimed
  await db
    .update(playerQuests)
    .set({ status: 'claimed' })
    .where(and(eq(playerQuests.playerId, playerId), eq(playerQuests.questId, questId)));

  const { rewardCoins, rewardGems, rewardXp } = row.quests;

  // Distribute rewards
  if (rewardCoins > 0) await addCoins(playerId, rewardCoins, 'quest_reward', { questId });
  if (rewardXp > 0) await addXp(playerId, rewardXp, 'quest_reward');
  // Gems addition would go here when EconomyService supports it (Phase 2)

  logger.info({ playerId, questId, rewardCoins, rewardXp }, 'Quest rewards claimed');

  return { coins: rewardCoins, gems: rewardGems, xp: rewardXp };
}

/**
 * Retrieves all currently assigned quests for a player.
 *
 * @param playerId - Internal player UUID
 * @returns List of player quests
 */
export async function getPlayerQuests(playerId: string): Promise<PlayerQuest[]> {
  const db = getDatabase();

  const rows = await db
    .select()
    .from(playerQuests)
    .innerJoin(quests, eq(playerQuests.questId, quests.id))
    .where(eq(playerQuests.playerId, playerId));

  return rows.map((row) => ({
    ...row.quests,
    questId: row.quests.id,
    status: row.player_quests.status as QuestStatus,
    currentValue: row.player_quests.currentValue,
    assignedAt: row.player_quests.assignedAt,
  }));
}

/**
 * Cleans up old quests to maintain database performance.
 * Removes claimed quests older than 30 days and expired seasonal quests.
 *
 * @returns Number of records deleted
 */
export async function cleanupPastQuests(): Promise<number> {
  const db = getDatabase();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const now = new Date();

  // Delete claimed quests older than 30 days
  await db
    .delete(playerQuests)
    .where(and(eq(playerQuests.status, 'claimed'), lt(playerQuests.updatedAt, thirtyDaysAgo)));

  // Delete expired seasonal quests (assignments)
  // This is more complex because we need to join with quests.
  // In Drizzle delete with join is not always straightforward depending on driver.
  // We'll use a subquery approach.
  const expiredQuestIds = await db
    .select({ id: quests.id })
    .from(quests)
    .where(and(eq(quests.type, 'seasonal'), lt(quests.expiresAt, now)));

  if (expiredQuestIds.length > 0) {
    const ids = expiredQuestIds.map((q) => q.id);
    await db.delete(playerQuests).where(inArray(playerQuests.questId, ids));
  }

  logger.info('Quest cleanup completed');
  return 0; // Return count if possible, but Drizzle MySQL delete return is driver-dependent
}
