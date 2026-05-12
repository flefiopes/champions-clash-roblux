/**
 * Player-factions join table schema definition.
 * Links a player to their chosen faction within a specific war.
 * A player can join at most one faction per war (enforced by composite PK).
 * Tracks both weekly (resettable) and all-time points independently.
 *
 * @module db/schema/player-factions
 */

import { mysqlTable, varchar, bigint, timestamp, primaryKey } from 'drizzle-orm/mysql-core';
import { players } from './players';
import { factions } from './factions';
import { wars } from './wars';

/**
 * Player–faction membership table.
 * One row per (player, war) pair — a player may join different factions across wars.
 */
export const playerFactions = mysqlTable(
  'player_factions',
  {
    /** References players.id */
    playerId: varchar('player_id', { length: 36 })
      .notNull()
      .references(() => players.id),

    /** References factions.id — the chosen faction for this war */
    factionId: varchar('faction_id', { length: 36 })
      .notNull()
      .references(() => factions.id),

    /** References wars.id — denormalized for efficient war-scoped queries */
    warId: varchar('war_id', { length: 36 })
      .notNull()
      .references(() => wars.id),

    /** Points contributed this week — reset every Monday by the cron job */
    weeklyPoints: bigint('weekly_points', { mode: 'number' }).notNull().default(0),

    /** All-time points contributed — never reset */
    alltimePoints: bigint('alltime_points', { mode: 'number' }).notNull().default(0),

    /** Timestamp of when the player joined the faction — used to enforce the 7-day lock */
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.playerId, table.warId] })]
);
