/**
 * Game configuration table schema definition.
 * Key-value store for runtime game settings (feature flags, multipliers, limits).
 * Roblox game servers poll GET /config every 5 minutes to receive updated values.
 * Admin dashboard can update individual keys without redeploying the server.
 *
 * @module db/schema/game-config
 */

import { mysqlTable, varchar, json, timestamp } from 'drizzle-orm/mysql-core';

/**
 * Game configuration table.
 * Each row is one configuration key with a JSON value and audit fields.
 */
export const gameConfig = mysqlTable('game_config', {
  /** Configuration key (e.g. "minigames", "global_multiplier") */
  key: varchar('key', { length: 100 }).primaryKey(),

  /**
   * JSON value — structure depends on key.
   * Example for "minigames": { race: true, combat: true, idle: false }
   * Example for "global_multiplier": 1.5
   */
  value: json('value').notNull(),

  /** Admin username who last modified this entry */
  updatedBy: varchar('updated_by', { length: 100 }).notNull(),

  /** Last modification timestamp */
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
