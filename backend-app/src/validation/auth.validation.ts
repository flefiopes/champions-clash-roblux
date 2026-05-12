/**
 * Authentication validation schemas.
 * Defines Zod schemas for login and registration request bodies.
 *
 * @module validation/auth
 */

import { z } from 'zod/v4';

/**
 * Registration request schema.
 * Password must contain at least one uppercase, one lowercase, one digit, and one special character.
 */
export const registerSchema = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
    ),
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters')
    .max(100, 'Username must not exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username may only contain letters, numbers, underscores, and hyphens'
    ),
});

/** Registration input type inferred from schema */
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login request schema.
 */
export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must not exceed 128 characters'),
});

/** Login input type inferred from schema */
export type LoginInput = z.infer<typeof loginSchema>;
