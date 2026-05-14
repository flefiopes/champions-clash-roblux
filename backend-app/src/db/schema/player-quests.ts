/**
 * PlayerQuests table schema definition.
 * Tracks individual player progress on assigned quests.
 *
 * @module db/schema/player-quests
 */

import { mysqlTable, varchar, int, timestamp, mysqlEnum, primaryKey } from 'drizzle-orm/mysql-core';
import { players } from './players';
import { quests } from './quests';

/**
 * PlayerQuests table.
 * Links players to quests and stores their current progress.
 */
export const playerQuests = mysqlTable(
  'player_quests',
  {
    /** Reference to the player */
    playerId: varchar('player_id', { length: 36 })
      .notNull()
      .references(() => players.id),

    /** Reference to the quest definition */
    questId: varchar('quest_id', { length: 36 })
      .notNull()
      .references(() => quests.id),

    /** Current lifecycle state of the quest for this player */
    status: mysqlEnum('status', ['active', 'completed', 'claimed']).notNull().default('active'),

    /** Current progress value (e.g. 5/10 coins earned) */
    currentValue: int('current_value').notNull().default(0),

    /** Timestamp when the quest was started/assigned */
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),

    /** Timestamp of the last progress update */
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    /** Composite primary key for unique player-quest pairing */
    primaryKey({ columns: [table.playerId, table.questId] }),
  ]
);
