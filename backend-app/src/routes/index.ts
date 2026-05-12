/**
 * Routes barrel export and central aggregator.
 * Mounts all application routes into a single Elysia group under /api/v1.
 *
 * @module routes
 */

import { Elysia } from 'elysia';
import { healthRoutes } from './health.routes';
import { playerRoutes } from './players.routes';
import { warRoutes } from './wars.routes';
import { purchaseRoutes } from './purchases.routes';
import { configRoutes } from './config.routes';
import { adminRoutes } from './admin.routes';

/**
 * API routes aggregator.
 * Combines all route modules under the /api/v1 prefix.
 * Public routes are registered before protected routes.
 */
export const apiRoutes = new Elysia({ prefix: '/api/v1' })
  // Infrastructure
  .use(healthRoutes)
  // Public (no auth) — config polling
  .use(configRoutes)
  // Roblox game server endpoints (X-API-Key)
  .use(playerRoutes)
  .use(warRoutes)
  .use(purchaseRoutes)
  // Admin dashboard endpoints (X-Admin-Key)
  .use(adminRoutes);
