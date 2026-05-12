/**
 * Routes barrel export and central aggregator.
 * Mounts all application routes into a single Elysia group under /api/v1.
 *
 * @module routes
 */

import { Elysia } from 'elysia';
import { healthRoutes } from './health.routes';
import { authRoutes } from './auth.routes';
import { userRoutes } from './users.routes';

/**
 * API routes aggregator.
 * Combines all route modules under the /api/v1 prefix.
 * Public routes are registered before auth-protected routes.
 */
export const apiRoutes = new Elysia({ prefix: '/api/v1' })
  // Public routes
  .use(healthRoutes)
  .use(authRoutes)
  // Auth-protected routes
  .use(userRoutes);
