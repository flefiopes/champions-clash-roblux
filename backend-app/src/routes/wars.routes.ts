/**
 * War routes.
 * Roblox-facing endpoints for active war listings and leaderboard retrieval.
 * All routes require a valid X-API-Key header.
 *
 * @module routes/wars
 */

import { Elysia } from 'elysia';
import { z } from 'zod/v4';
import { robloxAuthGuard } from '@/middleware/roblox-auth.middleware';
import { formatResponse, formatErrorResponse } from '@/lib/response-helpers';
import * as warService from '@/services/war/war.service';

/** Zod schema for warId path parameter */
const WarIdParam = z.object({ warId: z.string().uuid() });

/** Zod schema for optional leaderboard limit query parameter */
const LeaderboardQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

/**
 * War routes aggregator.
 * All routes are scoped under /wars and protected by robloxAuthGuard.
 */
export const warRoutes = new Elysia({ prefix: '/wars' })
  .use(robloxAuthGuard)

  /**
   * GET /wars/active
   * Returns all active wars with their factions and current scores.
   * Used by Roblox to populate the faction selection screen and the HUD score bar.
   */
  .get('/active', async () => {
    const activeWars = await warService.getActiveWars();
    return formatResponse(activeWars);
  })

  /**
   * GET /wars/:warId/leaderboard
   * Returns the top-N players per faction for the specified war.
   * Roblox polls this every 30 seconds for the in-game leaderboard board.
   */
  .get('/:warId/leaderboard', async ({ params, query, set }) => {
    const paramParsed = WarIdParam.safeParse(params);
    const queryParsed = LeaderboardQuery.safeParse(query);

    if (!paramParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid warId — must be a UUID');
    }

    const limit = queryParsed.success ? queryParsed.data.limit : 100;
    const leaderboard = await warService.getLeaderboard(paramParsed.data.warId, limit);
    return formatResponse(leaderboard);
  });
