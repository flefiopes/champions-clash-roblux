/**
 * Health check routes.
 * Provides endpoints for service health and readiness monitoring.
 * All check logic is delegated to the readiness service.
 *
 * @module routes/health
 */

import { Elysia } from 'elysia';
import { checkReadiness } from '@/services/health/readiness.service';
import { formatResponse } from '@/lib/response-helpers';

/**
 * Health routes plugin.
 * Provides /health and /health/ready endpoints.
 */
export const healthRoutes = new Elysia({ prefix: '/health' })
  /**
   * GET /health
   * Basic health check. Returns 200 if the server is running.
   */
  .get('/', () =>
    formatResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  )

  /**
   * GET /health/ready
   * Readiness check. Verifies all dependencies are available.
   * Returns 503 if any dependency is unhealthy.
   */
  .get('/ready', async ({ set }) => {
    const result = await checkReadiness();

    if (!result.healthy) {
      set.status = 503;
    }

    return formatResponse({
      ...result,
      timestamp: new Date().toISOString(),
    });
  });
