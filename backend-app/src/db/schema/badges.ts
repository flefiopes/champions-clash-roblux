/**
 * Badges table schema definition.
 * Defines collectible achievements and social status markers.
 *
 * @module db/schema/badges
 */

import { mysqlTable, varchar, text, boolean, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

/**
 * Badges table.
 * Stores the definition of all collectible badges in the game.
 */
export const badges = mysqlTable('badges', {
  /** Internal UUID primary key */
  id: varchar('id', { length: 36 }).primaryKey(),

  /** Unique internal name (kebab-case) for logic triggers */
  slug: varchar('slug', { length: 100 }).notNull().unique(),

  /** Display name shown in UI */
  name: varchar('name', { length: 150 }).notNull(),

  /** Flavor text or description of the achievement */
  description: text('description').notNull(),

  /** URL to the badge icon (S3/Minio path) */
  imageUrl: varchar('image_url', { length: 255 }).notNull(),

  /** Visual rarity tier for UI effects */
  rarity: mysqlEnum('rarity', ['common', 'rare', 'epic', 'legendary', 'secret'])
    .notNull()
    .default('common'),

  /** If false, the badge is seasonal or temporary and can be lost */
  isPermanent: boolean('is_permanent').notNull().default(true),

  /** Badge creation timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),

  /** Last modification timestamp */
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
