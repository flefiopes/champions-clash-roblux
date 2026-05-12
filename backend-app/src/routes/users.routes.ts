/**
 * User routes.
 * Thin controller layer — all business logic is delegated to user services.
 *
 * @module routes/users
 */

import { Elysia } from 'elysia';
import { authGuard } from '@/middleware/auth.middleware';
import { formatResponse, formatErrorResponse } from '@/lib/response-helpers';
import { getUserProfile, updateUsername, changePassword, softDeleteAccount } from '@/services/user';
import { updateProfileSchema, changePasswordSchema } from '@/validation';

/**
 * User routes plugin.
 * All routes require authentication via authGuard.
 */
export const userRoutes = new Elysia({ prefix: '/users' })
  .use(authGuard)

  /**
   * GET /users/me
   * Returns the currently authenticated user's profile.
   */
  .get('/me', async ({ auth, set }) => {
    if (!auth) {
      set.status = 401;
      return formatErrorResponse('UNAUTHORIZED', 'Authentication required');
    }

    const profile = await getUserProfile(auth.userId);
    return formatResponse(profile);
  })

  /**
   * PATCH /users/me
   * Updates the authenticated user's profile fields.
   */
  .patch('/me', async ({ auth, body, set }) => {
    if (!auth) {
      set.status = 401;
      return formatErrorResponse('UNAUTHORIZED', 'Authentication required');
    }

    const validated = updateProfileSchema.parse(body);

    if (!validated.username) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'No fields to update');
    }

    await updateUsername(auth.userId, validated.username);
    return formatResponse({ message: 'Profile updated successfully' });
  })

  /**
   * PATCH /users/me/password
   * Changes the authenticated user's password.
   */
  .patch('/me/password', async ({ auth, body, set }) => {
    if (!auth) {
      set.status = 401;
      return formatErrorResponse('UNAUTHORIZED', 'Authentication required');
    }

    const validated = changePasswordSchema.parse(body);
    await changePassword(auth.userId, validated.currentPassword, validated.newPassword);
    return formatResponse({ message: 'Password changed successfully' });
  })

  /**
   * DELETE /users/me
   * Soft-deletes the authenticated user's account.
   */
  .delete('/me', async ({ auth, set }) => {
    if (!auth) {
      set.status = 401;
      return formatErrorResponse('UNAUTHORIZED', 'Authentication required');
    }

    await softDeleteAccount(auth.userId);
    return formatResponse({ message: 'Account deleted successfully' });
  });
