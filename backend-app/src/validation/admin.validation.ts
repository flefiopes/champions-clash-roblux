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
export const BulkUpdateGameConfigSchema = z.record(
  z.string().min(1).max(100),
  z.unknown()
);

/**
 * Schema for POST /admin/products.
 */
export const CreateProductSchema = z.object({
  /** Roblox Developer Product ID — must match the Roblox Studio configuration */
  roblox_product_id: z.number().int().positive(),
  /** Product category */
  type: z.enum(['gems', 'boost', 'cosmetic', 'faction_reset']),
  /**
   * Effect payload — structure depends on type:
   * - gems:          { gems: number }
   * - boost:         { boost: string, duration_seconds: number, multiplier: number }
   * - cosmetic:      { item_id: string }
   * - faction_reset: {}
   */
  value: z.record(z.string(), z.unknown()),
  is_active: z.boolean().default(true),
});

/**
 * Schema for PATCH /admin/products/:id.
 */
export const UpdateProductSchema = z.object({
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
