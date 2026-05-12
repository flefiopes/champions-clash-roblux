/**
 * War validation schemas.
 * Zod schemas for war creation and update requests from the admin dashboard.
 *
 * @module validation/war
 */

import { z } from 'zod';

/**
 * Schema for POST /admin/wars.
 */
export const CreateWarSchema = z.object({
  /** Display name of the war */
  name: z.string().min(2).max(150),
  /** Whether weekly score resets are applied */
  reset_weekly: z.boolean().default(true),
  /**
   * Optional scheduled end date.
   * ISO 8601 string; null means the war runs indefinitely until manually finished.
   */
  ends_at: z.string().datetime({ offset: true }).nullable().optional(),
});

/**
 * Schema for PATCH /admin/wars/:id.
 * All fields are optional — only provided fields are updated.
 */
export const UpdateWarSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  status: z.enum(['active', 'paused', 'finished']).optional(),
  reset_weekly: z.boolean().optional(),
  ends_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type CreateWarInput = z.infer<typeof CreateWarSchema>;
export type UpdateWarInput = z.infer<typeof UpdateWarSchema>;
