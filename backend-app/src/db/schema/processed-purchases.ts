/**
 * Processed purchases table schema definition.
 * Idempotency store for Roblox MarketplaceService receipts.
 * Prevents double-granting items if the same purchaseId is submitted more than once.
 * A purchase is considered processed once a row exists for its purchaseId.
 *
 * @module db/schema/processed-purchases
 */

import { mysqlTable, varchar, int, bigint, timestamp } from 'drizzle-orm/mysql-core';
import { players } from './players';

/**
 * Processed purchases table.
 * One row per successfully handled Roblox purchase receipt.
 */
export const processedPurchases = mysqlTable('processed_purchases', {
  /**
   * Roblox PurchaseId — the idempotency key.
   * Roblox guarantees this is unique per transaction.
   */
  purchaseId: varchar('purchase_id', { length: 100 }).primaryKey(),

  /** Player who made the purchase */
  playerId: varchar('player_id', { length: 36 })
    .notNull()
    .references(() => players.id),

  /** Roblox Developer Product ID that was purchased */
  robloxProductId: int('roblox_product_id').notNull(),

  /** Roblox user ID at purchase time (denormalized for auditability) */
  robloxUserId: bigint('roblox_user_id', { mode: 'number' }).notNull(),

  /** Timestamp when the purchase was processed */
  processedAt: timestamp('processed_at').notNull().defaultNow(),
});
