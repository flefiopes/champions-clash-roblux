/**
 * Authentication middleware.
 * Verifies JWT tokens and attaches user context to the request.
 * Uses shared JWT plugin for token verification.
 *
 * @module middleware/auth
 */

import { Elysia } from 'elysia';
import { accessJwtPlugin } from '@/lib/jwt';
import { createChildLogger } from '@/lib/logger';
import { formatErrorResponse } from '@/lib/response-helpers';

/** Auth middleware logger */
const logger = createChildLogger({ module: 'auth-middleware' });

/**
 * context for an authenticated user.
 */
export interface AuthContext {
  userId: string;
  email: string;
}

/**
 * Extracts the token from the request.
 * Prioritizes Authorization header, then jwt_token cookie.
 *
 * @param request - The incoming request
 * @returns The token string or null if not found
 */
function extractToken(request: Request): string | null {
  // Try header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Fallback to cookie for jwt_token
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split('; ').reduce(
      (acc, currentCookie) => {
        const parts = currentCookie.split('=');
        const name = parts.shift()?.trim();
        if (name) {
          acc[name] = parts.join('=');
        }
        return acc;
      },
      {} as Record<string, string>
    );

    if (cookies['access_token']) {
      return cookies['access_token'];
    }
  }

  return null;
}

/**
 * Authentication guard middleware.
 * Verifies the access token and sets the user context.
 * Blocks the request if authentication fails.
 *
 * Supports token in:
 * - Authorization header (Bearer token)
 * - jwt_token Cookie (for "Remember me")
 */
export const authGuard = new Elysia({ name: 'auth-guard' })
  .use(accessJwtPlugin)
  .derive({ as: 'scoped' }, async ({ request, accessJwt }) => {
    const token = extractToken(request);

    if (!token) {
      return { auth: null };
    }

    const payload = await accessJwt.verify(token);

    if (!payload || !payload.sub) {
      logger.warn("Token validation failed: missing 'sub' claim");
      return { auth: null };
    }

    logger.debug({ userId: payload.sub }, 'Request successfully authenticated');

    return {
      auth: {
        userId: payload.sub as string,
        email: (payload.email as string) || '',
      } as AuthContext,
    };
  })
  .onBeforeHandle({ as: 'scoped' }, ({ auth, set }) => {
    if (!auth) {
      set.status = 401;
      return formatErrorResponse('UNAUTHORIZED', 'Authentication required');
    }
  });

/**
 * Optional authentication middleware.
 * Verifies the access token if present but allows unauthenticated requests.
 * Use for endpoints that work for both guests and logged-in users.
 */
export const optionalAuthGuard = new Elysia({ name: 'optional-auth-guard' })
  .use(accessJwtPlugin)
  .derive({ as: 'scoped' }, async ({ request, accessJwt }) => {
    const token = extractToken(request);

    if (!token) {
      return { auth: null };
    }

    const payload = await accessJwt.verify(token);

    if (!payload || !payload.sub) {
      return { auth: null };
    }

    return {
      auth: {
        userId: payload.sub as string,
        email: (payload.email as string) || '',
      } as AuthContext,
    };
  });
