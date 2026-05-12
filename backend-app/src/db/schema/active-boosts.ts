/**
 * Active boosts table schema definition.
 * Tracks time-limited point/coin multipliers applied to a specific player.
 * Rows are purged by the expire-boosts cron job when expires_at is in the past.
 *
 * @module db/schema/active-boosts
 */

import { mysqlTable, varchar, float, timestamp } from 'drizzle-orm/mysql-core';
import { players } from './players';

/**
 * Active boosts table.
 * One row per active multiplier per player. Multiple boosts can stack.
 */
export const activeBoosts = mysqlTable('active_boosts', {
  /** UUID v4 primary key */
  id: varchar('id', { length: 36 }).primaryKey(),

  /** Player this boost applies to */
  playerId: varchar('player_id', { length: 36 })
    .notNull()
    .references(() => players.id),

  /** Machine-readable boost type (e.g. "point_multiplier_x2", "coin_multiplier_x3") */
  type: varchar('type', { length: 50 }).notNull(),

  /** Multiplier value applied to the relevant economy action */
  multiplier: float('multiplier').notNull(),

  /** Timestamp after which this boost is considered expired and can be deleted */
  expiresAt: timestamp('expires_at').notNull(),

  /** Boost grant timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
