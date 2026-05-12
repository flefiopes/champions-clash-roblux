/**
 * Admin service.
 * Handles all admin-only operations: war and faction CRUD, transaction log queries,
 * game configuration management, and product catalogue management.
 *
 * @module services/admin
 */

import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getDatabase } from '@/db';
import { wars, factions, transactions, players, gameConfig, products } from '@/db/schema';
import { createChildLogger } from '@/lib/logger';
import { AppError, AppErrorCode } from '@/lib/app-error';
import type {
  CreateWarInput,
  UpdateWarInput,
  CreateFactionInput,
  UpdateFactionInput,
  UpdateGameConfigInput,
  CreateProductInput,
  UpdateProductInput,
  TransactionFilterInput,
} from '@/validation';
import type { PaginatedResponse } from '@/types';

/** Admin service logger */
const logger = createChildLogger({ module: 'admin-service' });

// ---------------------------------------------------------------------------
// War management
// ---------------------------------------------------------------------------

/**
 * Creates a new war and persists it with status = 'active'.
 *
 * @param data - Validated war creation input
 * @param adminUsername - Username of the admin creating the war
 * @returns The newly created war ID
 */
export async function createWar(data: CreateWarInput, adminUsername: string): Promise<string> {
  const db = getDatabase();
  const id = randomUUID();

  await db.insert(wars).values({
    id,
    name: data.name,
    resetWeekly: data.reset_weekly ?? true,
    endsAt: data.ends_at ? new Date(data.ends_at) : null,
    createdBy: adminUsername,
  });

  logger.info({ warId: id, name: data.name, adminUsername }, 'War created');
  return id;
}

/**
 * Updates mutable fields on an existing war.
 *
 * @param warId - War UUID to update
 * @param data - Partial war update fields
 * @throws AppError(WAR_NOT_FOUND) if the war does not exist
 */
export async function updateWar(warId: string, data: UpdateWarInput): Promise<void> {
  const db = getDatabase();

  const existing = await db.select({ id: wars.id }).from(wars).where(eq(wars.id, warId)).limit(1);
  if (!existing.length) {
    throw new AppError(AppErrorCode.WAR_NOT_FOUND, 'War not found', 404, { warId });
  }

  await db
    .update(wars)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.status && { status: data.status }),
      ...(data.reset_weekly !== undefined && { resetWeekly: data.reset_weekly }),
      ...(data.ends_at !== undefined && { endsAt: data.ends_at ? new Date(data.ends_at) : null }),
    })
    .where(eq(wars.id, warId));

  logger.info({ warId, changes: data }, 'War updated');
}

/**
 * Marks a war as finished.
 *
 * @param warId - War UUID to finish
 * @throws AppError(WAR_NOT_FOUND) if the war does not exist
 */
export async function finishWar(warId: string): Promise<void> {
  const db = getDatabase();

  const existing = await db.select({ id: wars.id }).from(wars).where(eq(wars.id, warId)).limit(1);
  if (!existing.length) {
    throw new AppError(AppErrorCode.WAR_NOT_FOUND, 'War not found', 404, { warId });
  }

  await db.update(wars).set({ status: 'finished' }).where(eq(wars.id, warId));
  logger.info({ warId }, 'War finished');
}

/**
 * Returns all wars (all statuses), ordered by creation date descending.
 */
export function listWars() {
  const db = getDatabase();
  return db.select().from(wars).orderBy(desc(wars.createdAt));
}

// ---------------------------------------------------------------------------
// Faction management
// ---------------------------------------------------------------------------

/**
 * Creates a new faction for an existing war.
 *
 * @param data - Validated faction creation input
 * @returns The newly created faction ID
 * @throws AppError(WAR_NOT_FOUND) if the parent war does not exist
 */
export async function createFaction(data: CreateFactionInput): Promise<string> {
  const db = getDatabase();

  const warExists = await db
    .select({ id: wars.id })
    .from(wars)
    .where(eq(wars.id, data.war_id))
    .limit(1);

  if (!warExists.length) {
    throw new AppError(AppErrorCode.WAR_NOT_FOUND, 'Parent war not found', 404, {
      warId: data.war_id,
    });
  }

  const id = randomUUID();
  await db.insert(factions).values({
    id,
    warId: data.war_id,
    name: data.name,
    colorHex: data.color_hex,
    slogan: data.slogan,
  });

  logger.info({ factionId: id, warId: data.war_id, name: data.name }, 'Faction created');
  return id;
}

/**
 * Updates mutable display fields on an existing faction.
 *
 * @param factionId - Faction UUID to update
 * @param data - Partial faction update fields
 * @throws AppError(FACTION_NOT_FOUND) if the faction does not exist
 */
export async function updateFaction(factionId: string, data: UpdateFactionInput): Promise<void> {
  const db = getDatabase();

  const existing = await db
    .select({ id: factions.id })
    .from(factions)
    .where(eq(factions.id, factionId))
    .limit(1);

  if (!existing.length) {
    throw new AppError(AppErrorCode.FACTION_NOT_FOUND, 'Faction not found', 404, { factionId });
  }

  await db
    .update(factions)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.color_hex && { colorHex: data.color_hex }),
      ...(data.slogan && { slogan: data.slogan }),
    })
    .where(eq(factions.id, factionId));

  logger.info({ factionId, changes: data }, 'Faction updated');
}

// ---------------------------------------------------------------------------
// Transaction logs
// ---------------------------------------------------------------------------

/**
 * Returns a paginated, filterable list of transaction records for the admin dashboard.
 *
 * @param filters - Filter and pagination parameters
 * @returns Paginated transaction list with player usernames
 */
export async function getTransactionLogs(
  filters: TransactionFilterInput
): Promise<PaginatedResponse<Record<string, unknown>>> {
  const db = getDatabase();

  const conditions = [];

  if (filters.player_id) {
    conditions.push(eq(transactions.playerId, filters.player_id));
  }
  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type));
  }
  if (filters.from) {
    conditions.push(gte(transactions.createdAt, new Date(filters.from)));
  }
  if (filters.to) {
    conditions.push(lte(transactions.createdAt, new Date(filters.to)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (filters.page - 1) * filters.limit;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: transactions.id,
        playerId: transactions.playerId,
        username: players.username,
        type: transactions.type,
        amount: transactions.amount,
        source: transactions.source,
        meta: transactions.meta,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(players, eq(transactions.playerId, players.id))
      .where(whereClause)
      .orderBy(desc(transactions.createdAt))
      .limit(filters.limit)
      .offset(offset),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    data: rows as Record<string, unknown>[],
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

// ---------------------------------------------------------------------------
// Game configuration
// ---------------------------------------------------------------------------

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
 * Inserts the key if it doesn't exist; updates the value and audit fields if it does.
 *
 * @param key - Configuration key to set
 * @param data - Validated configuration update input
 * @param adminUsername - Admin performing the update (for audit)
 */
export async function updateGameConfig(
  key: string,
  data: UpdateGameConfigInput,
  adminUsername: string
): Promise<void> {
  const db = getDatabase();

  await db
    .insert(gameConfig)
    .values({ key, value: data.value, updatedBy: adminUsername })
    .onDuplicateKeyUpdate({
      set: { value: data.value, updatedBy: adminUsername, updatedAt: new Date() },
    });

  logger.info({ key, adminUsername }, 'Game config updated');
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
    robloxProductId: data.roblox_product_id,
    type: data.type,
    value: data.value,
    isActive: data.is_active ?? true,
  });

  logger.info({ productId: id, robloxProductId: data.roblox_product_id }, 'Product created');
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
