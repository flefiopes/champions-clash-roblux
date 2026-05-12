/**
 * Products table schema definition.
 * Catalogue of purchasable items sold via Roblox MarketplaceService.
 * Each row maps a Roblox Product ID to its effect in the game economy.
 * Managed exclusively through the admin dashboard.
 *
 * @module db/schema/products
 */

import {
  mysqlTable,
  varchar,
  int,
  json,
  boolean,
  timestamp,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';

/**
 * Products table.
 * Defines every purchasable item and its in-game effect payload.
 */
export const products = mysqlTable('products', {
  /** Internal UUID primary key */
  id: varchar('id', { length: 36 }).primaryKey(),

  /**
   * Roblox Developer Product ID.
   * Must match the product configured in Roblox Studio exactly.
   */
  robloxProductId: int('roblox_product_id').notNull().unique(),

  /** Product category — determines how value JSON is interpreted */
  type: mysqlEnum('type', ['gems', 'boost', 'cosmetic', 'faction_reset']).notNull(),

  /**
   * Effect payload — structure depends on type:
   * - gems:          { gems: number }
   * - boost:         { boost: string, duration_seconds: number, multiplier: number }
   * - cosmetic:      { item_id: string }
   * - faction_reset: {}
   */
  value: json('value').notNull(),

  /** Whether this product is currently purchasable */
  isActive: boolean('is_active').notNull().default(true),

  /** Product creation timestamp */
  createdAt: timestamp('created_at').notNull().defaultNow(),

  /** Last modification timestamp */
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
