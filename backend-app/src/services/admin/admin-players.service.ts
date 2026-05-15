/**
 * Admin players service.
 * Handles player-related administrative tasks like leaderboards and prestige monitoring.
 *
 * @module services/admin/admin-players
 */

import { desc } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { players } from '@/db/schema';

/**
 * Returns the top players globally for leaderboard monitoring.
 *
 * @param limit - Number of players to return
 * @returns List of top players with their prestige and XP
 */
export function getTopPlayers(limit = 100) {
  const db = getDatabase();

  return db
    .select({
      id: players.id,
      pseudo: players.username,
      prestigeLevel: players.prestigeLevel,
      xp: players.xp,
      coins: players.coins,
      rank: players.rank,
    })
    .from(players)
    .orderBy(desc(players.prestigeLevel), desc(players.xp))
    .limit(limit);
}
