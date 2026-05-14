/**
 * Admin rewards service.
 * Handles administrative management of quests and badges.
 *
 * @module services/admin/admin-rewards
 */

import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDatabase } from '@/db';
import { quests, badges } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { AppError, AppErrorCode } from '@/lib/app-error';
import type {
  CreateQuestInput,
  UpdateQuestInput,
  CreateBadgeInput,
  UpdateBadgeInput,
} from '@/validation';

/** Admin rewards service logger */
const logger = createChildLogger({ module: 'admin-rewards-service' });

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------

/**
 * Lists all quest definitions.
 */
export async function listQuests() {
  const db = getDatabase();
  const questList = await db.select().from(quests).orderBy(desc(quests.createdAt));
  return questList;
}

/**
 * Creates a new quest definition.
 */
export async function createQuest(data: CreateQuestInput): Promise<string> {
  const db = getDatabase();
  const id = randomUUID();

  await db.insert(quests).values({
    id,
    type: data.type,
    title: data.title,
    description: data.description,
    requirementType: data.requirement_type,
    requirementValue: data.requirement_value,
    rewardCoins: data.reward_coins,
    rewardGems: data.reward_gems,
    rewardXp: data.reward_xp,
    rewardBadgeId: data.reward_badge_id,
    expiresAt: data.expires_at ? new Date(data.expires_at) : null,
  });

  logger.info({ questId: id, title: data.title }, 'Quest definition created');
  return id;
}

/**
 * Updates an existing quest definition.
 */
export async function updateQuest(questId: string, data: UpdateQuestInput): Promise<void> {
  const db = getDatabase();

  const [existing] = await db
    .select({ id: quests.id })
    .from(quests)
    .where(eq(quests.id, questId))
    .limit(1);
  if (!existing) throw new AppError(AppErrorCode.NOT_FOUND, 'Quest not found', 404);

  await db
    .update(quests)
    .set({
      ...(data.type && { type: data.type }),
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.requirement_type && { requirementType: data.requirement_type }),
      ...(data.requirement_value !== undefined && { requirementValue: data.requirement_value }),
      ...(data.reward_coins !== undefined && { rewardCoins: data.reward_coins }),
      ...(data.reward_gems !== undefined && { rewardGems: data.reward_gems }),
      ...(data.reward_xp !== undefined && { rewardXp: data.reward_xp }),
      ...(data.reward_badge_id !== undefined && { rewardBadgeId: data.reward_badge_id }),
      ...(data.expires_at !== undefined && {
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
      }),
    })
    .where(eq(quests.id, questId));

  logger.info({ questId, changes: data }, 'Quest definition updated');
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

/**
 * Lists all badge definitions.
 */
export async function listBadges() {
  const db = getDatabase();
  const badgesList = await db.select().from(badges).orderBy(desc(badges.createdAt));
  return badgesList;
}

/**
 * Creates a new badge definition.
 */
export async function createBadge(data: CreateBadgeInput): Promise<string> {
  const db = getDatabase();
  const id = randomUUID();

  await db.insert(badges).values({
    id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    imageUrl: data.image_url,
    rarity: data.rarity,
    isPermanent: data.is_permanent,
  });

  logger.info({ badgeId: id, slug: data.slug }, 'Badge definition created');
  return id;
}

/**
 * Updates an existing badge definition.
 */
export async function updateBadge(badgeId: string, data: UpdateBadgeInput): Promise<void> {
  const db = getDatabase();

  const [existing] = await db
    .select({ id: badges.id })
    .from(badges)
    .where(eq(badges.id, badgeId))
    .limit(1);
  if (!existing) throw new AppError(AppErrorCode.NOT_FOUND, 'Badge not found', 404);

  await db
    .update(badges)
    .set({
      ...(data.slug && { slug: data.slug }),
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.image_url && { imageUrl: data.image_url }),
      ...(data.rarity && { rarity: data.rarity }),
      ...(data.is_permanent !== undefined && { isPermanent: data.is_permanent }),
    })
    .where(eq(badges.id, badgeId));

  logger.info({ badgeId, changes: data }, 'Badge definition updated');
}
