/**
 * Wars table schema definition.
 * A war defines one competitive event between two or more factions.
 * Wars can run for a fixed duration or indefinitely, with optional weekly score resets.
 *
 * @module db/schema/wars
 */

import { mysqlTable, varchar, timestamp, boolean, mysqlEnum } from 'drizzle-orm/mysql-core';

/**
 * Wars table.
 * Each war is an independent competitive event with its own factions and leaderboard.
 */
export const wars = mysqlTable('wars', {
  /** Internal UUID primary key */
  id: varchar('id', { length: 36 }).primaryKey(),

  /** Display name of the war (e.g. "La Grande Joute des Champions") */
  name: varchar('name', { length: 150 }).notNull(),

  /** Current lifecycle state of the war */
  status: mysqlEnum('status', ['active', 'paused', 'finished']).notNull().default('active'),

  /** Whether weekly score resets are applied (most wars) */
  resetWeekly: boolean('reset_weekly').notNull().default(true),

  /** Timestamp of the last weekly reset — compared against player last_seen for UI */
  lastResetAt: timestamp('last_reset_at'),

  /** Optional scheduled end — null means the war runs until manually finished */
  endsAt: timestamp('ends_at'),

  /** Admin username who created the war */
  createdBy: varchar('created_by', { length: 100 }).notNull(),

  /** War creation timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),

  /** Last modification timestamp */
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
