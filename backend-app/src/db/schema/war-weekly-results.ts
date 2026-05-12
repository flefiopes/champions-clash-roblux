/**
 * War weekly results table schema definition.
 * Immutable historical record of each war's weekly reset outcome.
 * Snapshot is taken before weekly_points are zeroed, preserving the final standings.
 *
 * @module db/schema/war-weekly-results
 */

import { mysqlTable, varchar, date, json, timestamp } from 'drizzle-orm/mysql-core';
import { wars } from './wars';
import { factions } from './factions';

/**
 * War weekly results table.
 * One row per war per week, created by the weekly-war-reset cron job.
 */
export const warWeeklyResults = mysqlTable('war_weekly_results', {
  /** UUID v4 primary key */
  id: varchar('id', { length: 36 }).primaryKey(),

  /** The war this result belongs to */
  warId: varchar('war_id', { length: 36 })
    .notNull()
    .references(() => wars.id),

  /** Monday date marking the start of the recorded week */
  weekStart: date('week_start').notNull(),

  /** The faction that accumulated the most weekly_points this week */
  winnerFactionId: varchar('winner_faction_id', { length: 36 })
    .notNull()
    .references(() => factions.id),

  /**
   * JSON snapshot of the top contributors at reset time.
   * Shape: Array<{ playerId, username, weeklyPoints, factionId }>
   */
  snapshot: json('snapshot').notNull(),

  /** Result creation timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
