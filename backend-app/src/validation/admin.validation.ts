/**
 * Admin validation schemas.
 * Zod schemas for admin-only operations: factions, game config, products, and filters.
 *
 * @module validation/admin
 */

import { z } from 'zod';

/**
 * Schema for POST /admin/factions.
 */
export const CreateFactionSchema = z.object({
  /** Parent war UUID */
  war_id: z.string().uuid(),
  /** Display name of the faction */
  name: z.string().min(2).max(100),
  /** Hex color code including the leading # (e.g. "#DC143C") */
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g. #DC143C)'),
  /** Faction battle cry displayed on the selection screen */
  slogan: z.string().min(2).max(255),
});

/**
 * Schema for PATCH /admin/factions/:id.
 */
export const UpdateFactionSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  color_hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  slogan: z.string().min(2).max(255).optional(),
  total_points: z.number().int().min(0).optional(),
});

/**
 * Schema for PATCH /admin/config/:key.
 */
export const UpdateGameConfigSchema = z.object({
  /** JSON value to store — must be a non-null JSON-serializable value */
  value: z.unknown().refine((v) => v !== undefined, 'Value is required'),
});

/**
 * Schema for PUT /admin/config.
 */
export const BulkUpdateGameConfigSchema = z.record(z.string().min(1).max(100), z.unknown());

/**
 * Schema for POST /admin/products.
 */
export const CreateProductSchema = z.object({
  /** Display name for admin dashboard */
  name: z.string().min(2).max(100),
  /** Roblox Developer Product ID */
  roblox_product_id: z.number().int().positive(),
  /** Price in Robux */
  price_robux: z.number().int().min(0).default(0),
  /** Product category */
  type: z.enum(['gems', 'boost', 'cosmetic', 'faction_reset']),
  /** Effect payload */
  value: z.record(z.string(), z.unknown()),
  is_active: z.boolean().default(true),
});

/**
 * Schema for PATCH /admin/products/:id.
 */
export const UpdateProductSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  price_robux: z.number().int().min(0).optional(),
  type: z.enum(['gems', 'boost', 'cosmetic', 'faction_reset']).optional(),
  value: z.record(z.string(), z.unknown()).optional(),
  is_active: z.boolean().optional(),
});

/**
 * Query params schema for paginated admin lists (players, transactions).
 */
export const AdminPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

/**
 * Transaction log filter params.
 */
export const TransactionFilterSchema = AdminPaginationSchema.extend({
  player_id: z.string().uuid().optional(),
  type: z
    .enum(['coin_gain', 'coin_spend', 'gem_gain', 'gem_spend', 'point_contribution', 'xp_gain'])
    .optional(),
  source: z.string().min(1).max(100).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export type CreateFactionInput = z.infer<typeof CreateFactionSchema>;
export type UpdateFactionInput = z.infer<typeof UpdateFactionSchema>;
export type UpdateGameConfigInput = z.infer<typeof UpdateGameConfigSchema>;
export type BulkUpdateGameConfigInput = z.infer<typeof BulkUpdateGameConfigSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type AdminPaginationInput = z.infer<typeof AdminPaginationSchema>;
export type TransactionFilterInput = z.infer<typeof TransactionFilterSchema>;

// ---------------------------------------------------------------------------
// Quests
// ---------------------------------------------------------------------------

/** Zod schema for creating a new quest definition */
export const CreateQuestSchema = z.object({
  type: z.enum(['daily', 'recruit', 'seasonal', 'secret']),
  title: z.string().min(1).max(150),
  description: z.string().min(1),
  requirement_type: z.string().min(1).max(50),
  requirement_value: z.number().int().positive(),
  reward_coins: z.number().int().min(0).optional().default(0),
  reward_gems: z.number().int().min(0).optional().default(0),
  reward_xp: z.number().int().min(0).optional().default(0),
  reward_badge_id: z.string().uuid().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

/** Inferred type for quest creation */
export type CreateQuestInput = z.infer<typeof CreateQuestSchema>;

/** Zod schema for updating an existing quest */
export const UpdateQuestSchema = CreateQuestSchema.partial();

/** Inferred type for quest update */
export type UpdateQuestInput = z.infer<typeof UpdateQuestSchema>;

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

/** Zod schema for creating a new badge definition */
export const CreateBadgeSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(150),
  description: z.string().min(1),
  image_url: z.string().url().or(z.string().startsWith('/')),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'secret']).optional().default('common'),
  is_permanent: z.boolean().optional().default(true),
});

/** Inferred type for badge creation */
export type CreateBadgeInput = z.infer<typeof CreateBadgeSchema>;

/** Zod schema for updating an existing badge */
export const UpdateBadgeSchema = CreateBadgeSchema.partial();

/** Inferred type for badge update */
export type UpdateBadgeInput = z.infer<typeof UpdateBadgeSchema>;
