/**
 * PlayerBadges table schema definition.
 * Links players to their earned badges.
 *
 * @module db/schema/player-badges
 */

import { mysqlTable, varchar, timestamp, primaryKey } from 'drizzle-orm/mysql-core';
import { players } from './players';
import { badges } from './badges';

/**
 * PlayerBadges table.
 * Records which players have earned which badges.
 */
export const playerBadges = mysqlTable(
  'player_badges',
  {
    /** Reference to the player */
    playerId: varchar('player_id', { length: 36 })
      .notNull()
      .references(() => players.id),

    /** Reference to the badge */
    badgeId: varchar('badge_id', { length: 36 })
      .notNull()
      .references(() => badges.id),

    /** Timestamp when the badge was earned */
    acquiredAt: timestamp('acquired_at').notNull().defaultNow(),
  },
  (table) => [
    /** Composite primary key for unique player-badge pairing */
    primaryKey({ columns: [table.playerId, table.badgeId] }),
  ]
);
