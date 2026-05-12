/**
 * User validation schemas.
 * Defines Zod schemas for user profile and password update requests.
 *
 * @module validation/user
 */

import { z } from 'zod/v4';

/**
 * Profile update request schema.
 */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(100, 'Username must not exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username may only contain letters, numbers, underscores, and hyphens'
    )
    .optional(),
});

/** Profile update input type inferred from schema */
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Password change request schema.
 * New password must contain at least one uppercase, one lowercase, one digit, and one special character.
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must not exceed 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
      'New password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
    ),
});

/** Password change input type inferred from schema */
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
