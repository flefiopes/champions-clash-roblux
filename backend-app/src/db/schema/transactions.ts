/**
 * Transactions table schema definition.
 * Immutable audit trail for all economy events (coins and gems in/out, point contributions).
 * Every balance change must produce a transaction row for integrity and anti-cheat purposes.
 *
 * @module db/schema/transactions
 */

import { mysqlTable, varchar, int, json, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';
import { players } from './players';

/**
 * Transactions table.
 * Records every economy operation with its source and optional contextual metadata.
 */
export const transactions = mysqlTable('transactions', {
  /** UUID v4 primary key */
  id: varchar('id', { length: 36 }).primaryKey(),

  /** Player whose balance was affected */
  playerId: varchar('player_id', { length: 36 })
    .notNull()
    .references(() => players.id),

  /** Type of economy operation */
  type: mysqlEnum('type', [
    'coin_gain',
    'coin_spend',
    'gem_gain',
    'gem_spend',
    'point_contribution',
    'xp_gain',
    'idle_collect',
    'upgrade_buy',
    'quest_reward',
  ]).notNull(),

  /** Amount of currency moved (always positive; direction encoded in `type`) */
  amount: int('amount').notNull(),

  /** Machine-readable source identifier (e.g. "minigame_race", "shop_multiplier") */
  source: varchar('source', { length: 100 }).notNull(),

  /** Arbitrary contextual data (e.g. { rank: 2, gameId: "race_xyz" }) */
  meta: json('meta'),

  /** Transaction creation timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
