/**
 * Factions table schema definition.
 * A faction belongs to exactly one war and represents one competing team.
 * The total_points column is a denormalized aggregate updated on every point contribution.
 *
 * @module db/schema/factions
 */

import { mysqlTable, varchar, bigint, timestamp } from 'drizzle-orm/mysql-core';
import { wars } from './wars';

/**
 * Factions table.
 * Each war must have at least two factions. Faction membership is stored in player_factions.
 */
export const factions = mysqlTable('factions', {
  /** Internal UUID primary key */
  id: varchar('id', { length: 36 }).primaryKey(),

  /** Parent war this faction belongs to */
  warId: varchar('war_id', { length: 36 })
    .notNull()
    .references(() => wars.id),

  /** Display name shown in-game (e.g. "Les Écarlates") */
  name: varchar('name', { length: 100 }).notNull(),

  /** Hex color code used for UI theming (e.g. "#DC143C") */
  colorHex: varchar('color_hex', { length: 7 }).notNull(),

  /** Short battle cry displayed on the faction selection screen */
  slogan: varchar('slogan', { length: 255 }).notNull(),

  /** Cumulative all-time points — never reset */
  totalPoints: bigint('total_points', { mode: 'number' }).notNull().default(0),

  /** Faction creation timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),

  /** Last modification timestamp */
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
