/**
 * Badge service.
 * Handles achievement unlocking and badge collection management.
 *
 * @module services/badge
 */

import { eq, and } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { badges, playerBadges } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import type { Badge } from '@/types';

/** Badge service logger */
const logger = createChildLogger({ module: 'badge-service' });

/**
 * Awards a badge to a player if they don't already have it.
 *
 * @param playerId - Internal player UUID
 * @param badgeSlug - Internal unique identifier for the badge
 */
export async function awardBadge(playerId: string, badgeSlug: string): Promise<void> {
  const db = getDatabase();

  // 1. Resolve badge by slug
  const [badge] = await db.select().from(badges).where(eq(badges.slug, badgeSlug)).limit(1);

  if (!badge) {
    logger.error({ badgeSlug }, 'Attempted to award non-existent badge');
    return;
  }

  // 2. Check if player already owns it
  const [existing] = await db
    .select()
    .from(playerBadges)
    .where(and(eq(playerBadges.playerId, playerId), eq(playerBadges.badgeId, badge.id)))
    .limit(1);

  if (existing) {
    return;
  }

  // 3. Award badge
  await db.insert(playerBadges).values({
    playerId,
    badgeId: badge.id,
    acquiredAt: new Date(),
  });

  logger.info({ playerId, badgeSlug, badgeId: badge.id }, 'Badge awarded');
}

/**
 * Retrieves the full collection of badges earned by a player.
 *
 * @param playerId - Internal player UUID
 * @returns List of earned badges with their full metadata
 */
export async function getPlayerBadges(playerId: string): Promise<Badge[]> {
  const db = getDatabase();

  const rows = await db
    .select()
    .from(playerBadges)
    .innerJoin(badges, eq(playerBadges.badgeId, badges.id))
    .where(eq(playerBadges.playerId, playerId));

  return rows.map((row) => ({
    id: row.badges.id,
    slug: row.badges.slug,
    name: row.badges.name,
    description: row.badges.description,
    imageUrl: row.badges.imageUrl,
    rarity: row.badges.rarity,
    isPermanent: row.badges.isPermanent,
  }));
}
