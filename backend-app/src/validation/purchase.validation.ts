/**
 * Purchase validation schemas.
 * Zod schema for Roblox MarketplaceService receipt processing.
 *
 * @module validation/purchase
 */

import { z } from 'zod';

/**
 * Schema for POST /purchases/process.
 * Sent by Roblox's ProcessReceipt callback after a successful purchase.
 * The purchaseId acts as the idempotency key — submitting the same ID twice is a no-op.
 */
export const ProcessPurchaseSchema = z.object({
  /** Roblox userId of the buyer */
  roblox_user_id: z.number().int().positive(),
  /** Roblox Developer Product ID that was purchased */
  roblox_product_id: z.number().int().positive(),
  /**
   * Roblox-issued purchase receipt ID.
   * Unique per transaction; used to prevent double-granting items.
   */
  purchase_id: z.string().min(1).max(100),
});

export type ProcessPurchaseInput = z.infer<typeof ProcessPurchaseSchema>;
