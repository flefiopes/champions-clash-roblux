/**
 * Roblox authentication middleware.
 * Validates the shared X-API-Key header sent by all Roblox game servers.
 * Optionally captures the X-Server-Id header for audit logging.
 * All Roblox-facing API endpoints must use this guard.
 *
 * @module middleware/roblox-auth
 */

import { Elysia } from 'elysia';
import { getEnvConfig } from '@/config';
import { createChildLogger } from '@/lib/logger';
import { formatErrorResponse } from '@/lib/response-helpers';

/** Roblox auth middleware logger */
const logger = createChildLogger({ module: 'roblox-auth' });

/**
 * Context injected into routes protected by this guard.
 */
export interface RobloxServerContext {
  /** The Roblox game server UUID from X-Server-Id header (may be empty string) */
  serverId: string;
}

/**
 * Roblox API key authentication guard.
 * Validates the X-API-Key header against the ROBLOX_API_KEY environment variable.
 * Injects serverId from the optional X-Server-Id header for downstream use.
 *
 * Returns 401 Unauthorized when the key is missing or incorrect.
 */
export const robloxAuthGuard = new Elysia({ name: 'roblox-auth-guard' })
  .derive({ as: 'scoped' }, ({ request }) => {
    const serverId = request.headers.get('x-server-id') ?? '';
    return { serverId };
  })
  .onBeforeHandle({ as: 'scoped' }, ({ request, set }) => {
    const env = getEnvConfig();
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey || apiKey !== env.security.robloxApiKey) {
      logger.warn(
        { path: new URL(request.url).pathname, hasKey: !!apiKey },
        'Roblox auth failed — invalid or missing X-API-Key'
      );
      set.status = 401;
      return formatErrorResponse('UNAUTHORIZED', 'Invalid or missing API key');
    }
  });
