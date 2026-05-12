/**
 * Auth services barrel export.
 * Provides centralized access to authentication-related services.
 *
 * @module services/auth
 */

// Auth service (register/login)
export { registerUser, loginUser } from './auth.service';
export type { RegisterData, RegisterResult, LoginResult } from './auth.service';

// Password service
export { hashPassword, verifyPassword } from './password.service';

// Token store service
export {
  storeRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
  revokeAllUserTokens,
} from './token-store.service';
