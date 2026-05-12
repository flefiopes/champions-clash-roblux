/**
 * JWT plugin configuration.
 * Exports pre-configured JWT plugins for authentication.
 *
 * @module lib/jwt
 */

import { jwt } from '@elysiajs/jwt';
import { getEnvConfig } from '@/config';

/**
 * Access token JWT plugin.
 * Used for short-lived authentication tokens.
 */
export const accessJwtPlugin = jwt({
  name: 'accessJwt',
  secret: getEnvConfig().jwt.secretAccess,
  exp: getEnvConfig().jwt.accessExpiresIn,
  alg: 'HS256',
});

/**
 * Refresh token JWT plugin.
 * Used for long-lived refresh tokens.
 */
export const refreshJwtPlugin = jwt({
  name: 'refreshJwt',
  secret: getEnvConfig().jwt.secretRefresh,
  exp: getEnvConfig().jwt.refreshExpiresIn,
  alg: 'HS256',
});
