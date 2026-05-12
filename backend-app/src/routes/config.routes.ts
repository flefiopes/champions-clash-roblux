/**
 * Config routes.
 * Public endpoint returning the runtime game configuration snapshot.
 * Roblox game servers poll this every 5 minutes to hot-reload feature flags and multipliers.
 * Responses are served from Redis cache to minimize DB load.
 *
 * @module routes/config
 */

import { Elysia } from 'elysia';
import { formatResponse } from '@/lib/response-helpers';
import { getPublicConfig } from '@/services/config/config.service';

/**
 * Config routes aggregator.
 * The /config endpoint is intentionally public — no API key required.
 * The data it exposes is non-sensitive (feature flags, multipliers).
 */
export const configRoutes = new Elysia({ prefix: '/config' })

  /**
   * GET /config
   * Returns the current public game configuration.
   * Cached in Redis for 60 seconds; updated on admin config changes.
   */
  .get('/', async () => {
    const config = await getPublicConfig();
    return formatResponse(config);
  });
