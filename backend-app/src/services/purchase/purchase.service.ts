/**
 * Purchase service.
 * Handles idempotent processing of Roblox MarketplaceService receipts.
 * Looks up the product, checks for a duplicate purchaseId, then grants the
 * corresponding reward (gems, boost, faction_reset, etc.) to the buyer.
 *
 * @module services/purchase
 */

import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDatabase } from '@/db';
import { players, products, processedPurchases, activeBoosts, transactions } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { AppError, AppErrorCode } from '@/lib/app-error';
import type { BoostProductValue, GemsProductValue } from '@/types';
import { sql } from 'drizzle-orm';

/** Purchase service logger */
const logger = createChildLogger({ module: 'purchase-service' });

/**
 * Result returned after a successful purchase processing.
 */
export interface PurchaseResult {
  /** Whether the purchase was newly processed (true) or already handled before (false) */
  alreadyProcessed: boolean;
  /** Updated gem balance (null if non-gem purchase) */
  newGemBalance?: number;
}

/**
 * Idempotently processes a Roblox purchase receipt.
 *
 * Flow:
 * 1. Validate the product exists and is active.
 * 2. Resolve the buyer's internal player ID (creates the player if needed).
 * 3. Check if purchaseId was already processed (idempotency guard).
 * 4. Apply the product effect (gems credit, boost activation, etc.).
 * 5. Record the receipt in processed_purchases.
 *
 * @param robloxUserId - Roblox userId of the buyer
 * @param robloxProductId - Roblox product ID that was purchased
 * @param purchaseId - Roblox receipt ID (idempotency key)
 * @returns Purchase result with alreadyProcessed flag and optional new balance
 * @throws AppError(PRODUCT_NOT_FOUND) if the product is unknown
 * @throws AppError(PRODUCT_INACTIVE) if the product is disabled
 * @throws AppError(PLAYER_NOT_FOUND) if no player record exists for the buyer
 */
export async function processPurchase(
  robloxUserId: number,
  robloxProductId: number,
  purchaseId: string
): Promise<PurchaseResult> {
  const db = getDatabase();

  // Resolve product
  const productRows = await db
    .select()
    .from(products)
    .where(eq(products.robloxProductId, robloxProductId))
    .limit(1);

  if (!productRows.length) {
    throw new AppError(AppErrorCode.PRODUCT_NOT_FOUND, 'Product not found', 404, {
      robloxProductId,
    });
  }

  const product = productRows[0]!;

  if (!product.isActive) {
    throw new AppError(
      AppErrorCode.PRODUCT_INACTIVE,
      'This product is currently unavailable',
      400,
      {
        robloxProductId,
      }
    );
  }

  // Resolve player
  const playerRows = await db
    .select({ id: players.id, gems: players.gems })
    .from(players)
    .where(eq(players.robloxUserId, robloxUserId))
    .limit(1);

  if (!playerRows.length) {
    throw new AppError(
      AppErrorCode.PLAYER_NOT_FOUND,
      'Player not found — login required before purchase',
      404,
      {
        robloxUserId,
      }
    );
  }

  const player = playerRows[0]!;

  // Idempotency check
  const existing = await db
    .select({ purchaseId: processedPurchases.purchaseId })
    .from(processedPurchases)
    .where(
      and(eq(processedPurchases.purchaseId, purchaseId), eq(processedPurchases.playerId, player.id))
    )
    .limit(1);

  if (existing.length > 0) {
    logger.info(
      { purchaseId, playerId: player.id },
      'Purchase already processed — returning early'
    );
    return { alreadyProcessed: true };
  }

  // Apply product effect
  let newGemBalance: number | undefined;

  switch (product.type) {
    case 'gems': {
      const value = product.value as GemsProductValue;
      await db
        .update(players)
        .set({ gems: sql`${players.gems} + ${value.gems}` })
        .where(eq(players.id, player.id));

      await db.insert(transactions).values({
        id: randomUUID(),
        playerId: player.id,
        type: 'gem_gain',
        amount: value.gems,
        source: `purchase_${robloxProductId}`,
        meta: { purchase_id: purchaseId },
      });

      newGemBalance = player.gems + value.gems;
      break;
    }

    case 'boost': {
      const value = product.value as BoostProductValue;
      const expiresAt = new Date(Date.now() + value.duration_seconds * 1000);

      await db.insert(activeBoosts).values({
        id: randomUUID(),
        playerId: player.id,
        type: value.boost,
        multiplier: value.multiplier,
        expiresAt,
      });
      break;
    }

    case 'faction_reset': {
      // Phase 2: Faction reset logic (remove the player's current faction lock)
      // For now, the purchase is recorded but no effect is applied.
      logger.info(
        { playerId: player.id },
        'Faction reset purchase recorded (effect pending Phase 2)'
      );
      break;
    }

    case 'cosmetic': {
      // Phase 3: Cosmetic grant (stored in a future cosmetics table)
      logger.info(
        { playerId: player.id, productId: product.id },
        'Cosmetic purchase recorded (effect pending Phase 3)'
      );
      break;
    }

    default: {
      logger.warn(
        { productType: product.type },
        'Unknown product type — purchase recorded without effect'
      );
    }
  }

  // Record receipt for idempotency
  await db.insert(processedPurchases).values({
    purchaseId,
    playerId: player.id,
    robloxProductId,
    robloxUserId,
  });

  logger.info(
    { purchaseId, playerId: player.id, robloxProductId, productType: product.type },
    'Purchase processed successfully'
  );

  return { alreadyProcessed: false, newGemBalance };
}
