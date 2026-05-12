/**
 * Admin authentication middleware.
 * Validates the X-Admin-Key header sent by the internal admin dashboard.
 * Uses a separate, stronger secret (ADMIN_API_KEY) distinct from the Roblox key.
 * All admin access is logged with IP address and path for auditability.
 *
 * @module middleware/admin-auth
 */

import { Elysia } from 'elysia';
import { getEnvConfig } from '@/config';
import { createChildLogger } from '@/lib/logger';
import { formatErrorResponse } from '@/lib/response-helpers';

/** Admin auth middleware logger */
const logger = createChildLogger({ module: 'admin-auth' });

/**
 * Admin API key authentication guard.
 * Validates the X-Admin-Key header against the ADMIN_API_KEY environment variable.
 * Logs every authenticated admin request with the caller's IP for audit trails.
 *
 * Returns 401 Unauthorized when the key is missing or incorrect.
 */
export const adminAuthGuard = new Elysia({ name: 'admin-auth-guard' }).onBeforeHandle(
  { as: 'scoped' },
  ({ request, set }) => {
    const env = getEnvConfig();
    const adminKey = request.headers.get('x-admin-key');
    const url = new URL(request.url);

    if (!adminKey || adminKey !== env.security.adminApiKey) {
      logger.warn(
        { path: url.pathname, method: request.method, hasKey: !!adminKey },
        'Admin auth failed — invalid or missing X-Admin-Key'
      );
      set.status = 401;
      return formatErrorResponse('UNAUTHORIZED', 'Invalid or missing admin key');
    }

    // Log authenticated admin access for audit trail
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

    logger.info(
      { path: url.pathname, method: request.method, ip: clientIp },
      'Admin request authenticated'
    );
  }
);
