/**
 * Authentication routes.
 * Thin controller layer — all business logic is delegated to auth services.
 * Uses HTTP-Only cookies for refresh token storage.
 * Rate limiting is applied per endpoint via configurable env limits.
 *
 * @module routes/auth
 */

import { Elysia } from 'elysia';
import { accessJwtPlugin, refreshJwtPlugin } from '@/lib/jwt';
import {
  registerUser,
  loginUser,
  storeRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
} from '@/services/auth';
import { registerSchema, loginSchema } from '@/validation';
import { setRefreshCookie, clearRefreshCookie, getRefreshToken } from '@/lib/cookie';
import { formatResponse, formatErrorResponse } from '@/lib/response-helpers';
import { createChildLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limiter';
import { getEnvConfig } from '@/config';

/** Auth routes logger */
const logger = createChildLogger({ module: 'auth-routes' });

/**
 * Auth routes plugin.
 * Provides register, login, refresh, and logout endpoints.
 */
export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(accessJwtPlugin)
  .use(refreshJwtPlugin)

  /**
   * POST /auth/register
   * Creates a new user account and returns access token.
   * Rate limited to prevent abuse.
   */
  .use(
    rateLimit({
      keyPrefix: 'auth:register',
      maxRequests: getEnvConfig().rateLimit.registerMaxRequests,
      windowSeconds: getEnvConfig().rateLimit.registerWindowSeconds,
    })
  )
  .post('/register', async ({ body, set, cookie, accessJwt, refreshJwt }) => {
    const validated = registerSchema.parse(body);
    const result = await registerUser(validated);

    // Generate tokens
    const jti = crypto.randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      accessJwt.sign({ sub: result.userId, email: result.email, type: 'access' }),
      refreshJwt.sign({ sub: result.userId, email: result.email, type: 'refresh', jti }),
    ]);

    await storeRefreshToken(result.userId, jti);
    setRefreshCookie(cookie, refreshToken);

    set.status = 201;
    logger.info({ userId: result.userId }, 'User registered');

    return formatResponse({
      user: { id: result.userId, email: result.email, username: result.username },
      tokens: { accessToken },
    });
  })

  /**
   * POST /auth/login
   * Authenticates user and returns access token.
   * Rate limited to prevent brute-force attacks.
   */
  .use(
    rateLimit({
      keyPrefix: 'auth:login',
      maxRequests: getEnvConfig().rateLimit.loginMaxRequests,
      windowSeconds: getEnvConfig().rateLimit.loginWindowSeconds,
    })
  )
  .post('/login', async ({ body, cookie, accessJwt, refreshJwt }) => {
    const validated = loginSchema.parse(body);
    const result = await loginUser(validated.email, validated.password);

    // Generate tokens
    const jti = crypto.randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      accessJwt.sign({ sub: result.userId, email: result.email, type: 'access' }),
      refreshJwt.sign({ sub: result.userId, email: result.email, type: 'refresh', jti }),
    ]);

    await storeRefreshToken(result.userId, jti);
    setRefreshCookie(cookie, refreshToken);

    logger.info({ userId: result.userId }, 'User logged in');

    return formatResponse({
      user: { id: result.userId, email: result.email, username: result.username },
      tokens: { accessToken },
    });
  })

  /**
   * POST /auth/refresh
   * Refreshes access token using refresh token from cookie.
   * Rotates refresh token for security.
   * Rate limited to prevent token abuse.
   */
  .use(
    rateLimit({
      keyPrefix: 'auth:refresh',
      maxRequests: getEnvConfig().rateLimit.refreshMaxRequests,
      windowSeconds: getEnvConfig().rateLimit.refreshWindowSeconds,
    })
  )
  .post('/refresh', async ({ set, cookie, accessJwt, refreshJwt }) => {
    const refreshTokenValue = getRefreshToken(cookie);

    if (!refreshTokenValue) {
      set.status = 401;
      return formatErrorResponse('MISSING_TOKEN', 'Refresh token not found');
    }

    const payload = await refreshJwt.verify(refreshTokenValue);
    if (!payload || !payload.sub || !payload.jti) {
      clearRefreshCookie(cookie);
      set.status = 401;
      return formatErrorResponse('INVALID_TOKEN', 'Invalid refresh token');
    }

    const valid = await isRefreshTokenValid(payload.sub as string, payload.jti as string);
    if (!valid) {
      clearRefreshCookie(cookie);
      set.status = 401;
      return formatErrorResponse('TOKEN_EXPIRED', 'Refresh token has been revoked');
    }

    await revokeRefreshToken(payload.sub as string, payload.jti as string);

    // Generate new token pair
    const newJti = crypto.randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      accessJwt.sign({ sub: payload.sub, email: payload.email, type: 'access' }),
      refreshJwt.sign({ sub: payload.sub, email: payload.email, type: 'refresh', jti: newJti }),
    ]);

    await storeRefreshToken(payload.sub as string, newJti);
    setRefreshCookie(cookie, refreshToken);

    return formatResponse({ tokens: { accessToken } });
  })

  /**
   * POST /auth/logout
   * Invalidates refresh token and clears cookie.
   */
  .post('/logout', async ({ cookie, refreshJwt }) => {
    const refreshTokenValue = getRefreshToken(cookie);

    if (refreshTokenValue) {
      const payload = await refreshJwt.verify(refreshTokenValue);
      if (payload && payload.sub && payload.jti) {
        await revokeRefreshToken(payload.sub as string, payload.jti as string);
        logger.info({ userId: payload.sub }, 'User logged out');
      }
    }

    clearRefreshCookie(cookie);
    return formatResponse({ message: 'Logged out successfully' });
  });
