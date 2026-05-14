/**
 * Admin Configuration Service.
 * Handles game-wide settings (feature flags, multipliers) and the product catalogue.
 *
 * @module services/admin/admin-config
 */

import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDatabase } from '@/db';
import { gameConfig, products } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { AppError, AppErrorCode } from '@/lib/app-error';
import type {
  UpdateGameConfigInput,
  BulkUpdateGameConfigInput,
  CreateProductInput,
  UpdateProductInput,
} from '@/validation';

/** Admin config service logger */
const logger = createChildLogger({ module: 'admin-config-service' });

// ---------------------------------------------------------------------------
// Game configuration
// ---------------------------------------------------------------------------

/**
 * Simple helper to convert camelCase keys to snake_case for DB storage.
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Retrieves all game configuration entries.
 *
 * @returns Key-value map of all configuration entries
 */
export async function getGameConfig(): Promise<Record<string, unknown>> {
  const db = getDatabase();
  const rows = await db.select().from(gameConfig);

  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/**
 * Upserts a single game configuration key.
 * Normalizes the key to snake_case.
 *
 * @param key - Configuration key to set
 * @param data - Validated configuration update input
 * @param adminUsername - Admin performing the update
 */
export async function updateGameConfig(
  key: string,
  data: UpdateGameConfigInput,
  adminUsername: string
): Promise<void> {
  const db = getDatabase();
  const normalizedKey = camelToSnake(key);

  await db
    .insert(gameConfig)
    .values({ key: normalizedKey, value: data.value, updatedBy: adminUsername })
    .onDuplicateKeyUpdate({
      set: { value: data.value, updatedBy: adminUsername, updatedAt: new Date() },
    });

  logger.info({ key, normalizedKey, adminUsername }, 'Game config updated');
}

/**
 * Updates multiple game configuration keys in a single transaction.
 * Normalizes keys to snake_case.
 *
 * @param data - Map of configuration keys to their new JSON values
 * @param adminUsername - Admin performing the update
 */
export async function updateGameConfigBulk(
  data: BulkUpdateGameConfigInput,
  adminUsername: string
): Promise<void> {
  const db = getDatabase();

  await db.transaction(async (tx) => {
    for (const [key, value] of Object.entries(data)) {
      const normalizedKey = camelToSnake(key);
      await tx
        .insert(gameConfig)
        .values({ key: normalizedKey, value, updatedBy: adminUsername })
        .onDuplicateKeyUpdate({
          set: { value, updatedBy: adminUsername, updatedAt: new Date() },
        });
    }
  });

  logger.info({ keys: Object.keys(data), adminUsername }, 'Bulk game config updated');
}

// ---------------------------------------------------------------------------
// Product catalogue
// ---------------------------------------------------------------------------

/**
 * Creates a new purchasable product in the catalogue.
 *
 * @param data - Validated product creation input
 * @returns The newly created product ID
 */
export async function createProduct(data: CreateProductInput): Promise<string> {
  const db = getDatabase();
  const id = randomUUID();

  await db.insert(products).values({
    id,
    name: data.name,
    robloxProductId: data.roblox_product_id,
    priceRobux: data.price_robux,
    type: data.type,
    value: data.value,
    isActive: data.is_active ?? true,
  });

  logger.info({ productId: id, name: data.name, robloxProductId: data.roblox_product_id }, 'Product created');
  return id;
}

/**
 * Updates an existing product's fields.
 *
 * @param productId - Internal product UUID
 * @param data - Partial product update
 */
export async function updateProduct(productId: string, data: UpdateProductInput): Promise<void> {
  const db = getDatabase();

  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!existing.length) {
    throw new AppError(AppErrorCode.NOT_FOUND, 'Product not found', 404, { productId });
  }

  await db
    .update(products)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.price_robux !== undefined && { priceRobux: data.price_robux }),
      ...(data.type && { type: data.type }),
      ...(data.value && { value: data.value }),
      ...(data.is_active !== undefined && { isActive: data.is_active }),
    })
    .where(eq(products.id, productId));

  logger.info({ productId, changes: data }, 'Product updated');
}

/**
 * Returns all products in the catalogue, ordered by Roblox product ID.
 */
export function listProducts() {
  const db = getDatabase();
  return db.select().from(products).orderBy(products.robloxProductId);
}
