/**
 * Quests table schema definition.
 * Defines various types of missions players can complete for rewards.
 * Quests can be recurring (daily), one-time (recruit), or seasonal.
 *
 * @module db/schema/quests
 */

import { mysqlTable, varchar, text, int, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

/**
 * Quests table.
 * Contains the definition of missions and their requirements.
 */
export const quests = mysqlTable('quests', {
  /** Internal UUID primary key */
  id: varchar('id', { length: 36 }).primaryKey(),

  /** Type of quest: daily reset, recruit tutorial, seasonal event, or hidden secret */
  type: mysqlEnum('type', ['daily', 'recruit', 'seasonal', 'secret']).notNull().default('daily'),

  /** Display title of the mission */
  title: varchar('title', { length: 150 }).notNull(),

  /** Detailed instructions for the player */
  description: text('description').notNull(),

  /** Metric being tracked (e.g. 'coins_earned', 'games_played') */
  requirementType: varchar('requirement_type', { length: 50 }).notNull(),

  /** Target value to reach to complete the quest */
  requirementValue: int('requirement_value').notNull(),

  /** Coin reward upon completion */
  rewardCoins: int('reward_coins').notNull().default(0),

  /** Gem reward upon completion */
  rewardGems: int('reward_gems').notNull().default(0),

  /** XP reward upon completion */
  rewardXp: int('reward_xp').notNull().default(0),

  /** Optional badge UUID awarded upon completion */
  rewardBadgeId: varchar('reward_badge_id', { length: 36 }),

  /** Optional expiration timestamp (for seasonal quests) */
  expiresAt: timestamp('expires_at'),

  /** Quest creation timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),

  /** Last modification timestamp */
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
