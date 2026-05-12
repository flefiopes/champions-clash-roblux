/**
 * Validation schemas barrel export.
 * Re-exports all validation schemas for use in route handlers.
 *
 * @module validation
 */

export { registerSchema, loginSchema } from './auth.validation';
export type { RegisterInput, LoginInput } from './auth.validation';

export { updateProfileSchema, changePasswordSchema } from './user.validation';
export type { UpdateProfileInput, ChangePasswordInput } from './user.validation';
