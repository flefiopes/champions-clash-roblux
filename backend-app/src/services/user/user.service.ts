/**
 * User service module.
 * Handles user profile operations (read, update, delete).
 * All database access for user management is encapsulated here.
 *
 * @module services/user/user
 */

import { eq } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { users } from '@/db/schema';
import { hashPassword, verifyPassword } from '@/services/auth/password.service';
import { revokeAllUserTokens } from '@/services/auth/token-store.service';
import { AppError, AppErrorCode } from '@/lib/app-error';
import { createChildLogger } from '@/lib/logger';

/** User service logger */
const logger = createChildLogger({ module: 'user-service' });

/**
 * Public user profile returned to the client.
 */
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  isVerifiedEmail: boolean;
  createdAt: Date;
}

/**
 * Retrieves the profile of a user by ID.
 *
 * @param userId - User UUID
 * @returns User profile
 * @throws AppError if user is not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const db = getDatabase();

 
}

/**
 * Updates the username of a user.
 *
 * @param userId - User UUID
 * @param username - New username
 * @throws AppError if username is already taken
 */
export async function updateUsername(userId: string, username: string): Promise<void> {
  const db = getDatabase();
 
}

/**
 * Changes the password of a user after verifying the current one.
 *
 * @param userId - User UUID
 * @param currentPassword - Current password for verification
 * @param newPassword - New password to set
 * @throws AppError if user is not found or current password is incorrect
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const db = getDatabase();

  c

  logger.info({ userId }, 'Password changed');
}

/**
 * Soft-deletes a user account by setting its status to "deleted".
 *
 * @param userId - User UUID
 */
export async function softDeleteAccount(userId: string): Promise<void> {
  const db = getDatabase();

  await db.update(users).set({ accountStatus: 'deleted' }).where(eq(users.id, userId));

  // Revoke all active sessions so the user is immediately logged out
  await revokeAllUserTokens(userId);

  logger.info({ userId }, 'Account soft-deleted');
}
