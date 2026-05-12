/**
 * Cookie utility module.
 * Provides helpers for secure cookie management.
 *
 * @module lib/cookie
 */

import { getEnvConfig } from '@/config';

/** Refresh token cookie name */
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * Returns cookie options for refresh token.
 * Configured for security best practices.
 *
 * @returns Cookie options object
 */
export function getRefreshCookieOptions() {
  const env = getEnvConfig();
  const isProduction = env.nodeEnv === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/api/v1/auth',
    maxAge: env.cookie.maxAgeDays * 24 * 60 * 60,
  };
}

/**
 * Sets refresh token as HTTP-Only cookie.
 *
 * @param cookie - Elysia cookie context
 * @param token - Refresh token string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setRefreshCookie(cookie: any, token: string): void {
  const options = getRefreshCookieOptions();
  cookie[REFRESH_TOKEN_COOKIE].set({
    value: token,
    ...options,
  });
}

/**
 * Clears refresh token cookie.
 *
 * @param cookie - Elysia cookie context
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clearRefreshCookie(cookie: any): void {
  cookie[REFRESH_TOKEN_COOKIE].set({
    value: '',
    httpOnly: true,
    secure: getEnvConfig().nodeEnv === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 0,
  });
}

/**
 * Gets refresh token value from cookie.
 *
 * @param cookie - Elysia cookie context
 * @returns Refresh token string or undefined
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRefreshToken(cookie: any): string | undefined {
  return cookie[REFRESH_TOKEN_COOKIE]?.value;
}
