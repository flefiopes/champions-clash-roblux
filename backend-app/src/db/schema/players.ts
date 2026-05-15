/**
 * Players table schema definition.
 * Represents Roblox player accounts with their economy state and progression.
 * The roblox_user_id is the canonical external identifier used by all game servers.
 *
 * @module db/schema/players
 */

import { mysqlTable, varchar, bigint, int, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

/**
 * Players table.
 * Stores one row per Roblox user. Created on first login via POST /players/login.
 */
export const players = mysqlTable('players', {
  /** Internal UUID primary key */
  id: varchar('id', { length: 36 }).primaryKey(),

  /** Roblox player unique identifier (source of truth) */
  robloxUserId: bigint('roblox_user_id', { mode: 'number' }).notNull().unique(),

  /** Roblox display name at time of last login */
  username: varchar('username', { length: 100 }).notNull(),

  /** Soft currency — earned from mini-games and daily bonuses */
  coins: bigint('coins', { mode: 'number' }).notNull().default(0),

  /** Hard currency — purchased with Robux */
  gems: bigint('gems', { mode: 'number' }).notNull().default(0),

  /** Total XP accumulated across all activities */
  xp: bigint('xp', { mode: 'number' }).notNull().default(0),

  /** Player rank within their faction, derived from alltime_points */
  rank: mysqlEnum('rank', [
    'recruit',
    'militant',
    'activist',
    'veteran',
    'elite',
    'champion',
    'legend',
  ])
    .notNull()
    .default('recruit'),

  /** Consecutive daily login streak counter */
  loginStreak: int('login_streak').notNull().default(0),

  /** Timestamp of last successful login — used for streak calculation */
  lastSeen: timestamp('last_seen'),

  /** Character upgrade: Force level (impacts mini-game performance) */
  forceLevel: int('force_level').notNull().default(0),

  /** Character upgrade: Speed level (impacts mini-game performance) */
  speedLevel: int('speed_level').notNull().default(0),

  /** Character upgrade: Luck level (impacts idle gains and rewards) */
  luckLevel: int('luck_level').notNull().default(0),

  /** Prestige level — resets rank for permanent bonuses */
  prestigeLevel: int('prestige_level').notNull().default(0),

  /** Average hour of the day (0-23) the player usually connects */
  avgSessionHour: int('avg_session_hour'),

  /** Last time the player collected their idle coin production */
  idleLastCollectedAt: timestamp('idle_last_collected_at'),

  /** Account creation timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),

  /** Last profile update timestamp */
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
