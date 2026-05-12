/**
 * Player validation schemas.
 * Zod schemas for all player-related request bodies and parameters.
 *
 * @module validation/player
 */

import { z } from 'zod';

/**
 * Schema for POST /players/login.
 * Sent by the Roblox server when a player joins.
 */
export const PlayerLoginSchema = z.object({
  /** Roblox userId — must be a positive integer */
  roblox_user_id: z.number().int().positive(),
  /** Roblox display name at time of login */
  username: z.string().min(1).max(100),
});

/**
 * Schema for POST /players/:robloxId/coins.
 * All economy actions are validated server-side; the client only sends what happened.
 */
export const CoinTransactionSchema = z.object({
  /**
   * Amount of coins to add (positive).
   * Capped at 10 000 per single action to prevent exploit submissions.
   */
  amount: z.number().int().positive().max(10_000),
  /** Machine-readable source (e.g. "minigame_race", "daily_login") */
  source: z.string().min(1).max(100),
  /** Optional contextual metadata for the transaction log */
  meta: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema for POST /players/:robloxId/points.
 * Converts coins to faction points in a single atomic operation.
 */
export const PointContributionSchema = z.object({
  /** Amount of coins the player wants to convert to points */
  coins_spent: z.number().int().positive(),
  /** Target faction UUID — must belong to the specified war */
  faction_id: z.string().uuid(),
  /** War UUID the contribution applies to */
  war_id: z.string().uuid(),
});

/**
 * Schema for POST /players/:robloxId/faction.
 * Assigns a player to a faction within a war.
 */
export const FactionJoinSchema = z.object({
  /** Faction UUID the player wants to join */
  faction_id: z.string().uuid(),
  /** War UUID in which the player is joining the faction */
  war_id: z.string().uuid(),
});

export type PlayerLoginInput = z.infer<typeof PlayerLoginSchema>;
export type CoinTransactionInput = z.infer<typeof CoinTransactionSchema>;
export type PointContributionInput = z.infer<typeof PointContributionSchema>;
export type FactionJoinInput = z.infer<typeof FactionJoinSchema>;
