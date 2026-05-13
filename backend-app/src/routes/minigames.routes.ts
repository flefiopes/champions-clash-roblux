/**
 * Mini-game routes.
 * Roblox-facing endpoints for reporting mini-game results and earning rewards.
 * All routes require a valid X-API-Key header.
 *
 * @module routes/minigames
 */

import { Elysia } from 'elysia';
import { z } from 'zod/v4';
import { robloxAuthGuard } from '@/middleware/roblox-auth.middleware';
import { formatResponse, formatErrorResponse } from '@/lib/response-helpers';
import * as minigameService from '@/services/minigame/minigame.service';

/** Zod schema for mini-game result submission */
const MinigameResultSchema = z.object({
  roblox_user_id: z.number().int().positive(),
  minigame_id: z.string().min(1),
  rank: z.number().int().min(1).max(100).optional(),
  score: z.number().optional(),
});

/**
 * Mini-game routes aggregator.
 * All routes are scoped under /minigames and protected by robloxAuthGuard.
 */
export const minigameRoutes = new Elysia({ prefix: '/minigames' })
  .use(robloxAuthGuard)

  /**
   * POST /minigames/result
   * Submits a mini-game result from a Roblox server instance.
   * Awards coins and XP based on performance and global configuration.
   */
  .post('/result', async ({ body, set }) => {
    const parsed = MinigameResultSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request body', {
        issues: parsed.error.issues,
      });
    }

    const { roblox_user_id, minigame_id, rank, score } = parsed.data;
    const result = await minigameService.processResult(roblox_user_id, minigame_id, rank, score);

    return formatResponse(result);
  });
