/**
 * User services barrel export.
 * Provides centralized access to user-related services.
 *
 * @module services/user
 */

export { getUserProfile, updateUsername, changePassword, softDeleteAccount } from './user.service';

export type { UserProfile } from './user.service';
