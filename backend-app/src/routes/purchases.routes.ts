/**
 * Purchase routes.
 * Roblox-facing endpoint for idempotent receipt processing.
 * Called from Roblox's ProcessReceipt callback after every successful Robux purchase.
 * All routes require a valid X-API-Key header.
 *
 * @module routes/purchases
 */

import { Elysia } from 'elysia';
import { robloxAuthGuard } from '@/middleware/roblox-auth.middleware';
import { rateLimit } from '@/lib/rate-limiter';
import { getEnvConfig } from '@/config';
import { formatResponse, formatErrorResponse } from '@/lib/response-helpers';
import { processPurchase } from '@/services/purchase/purchase.service';
import { ProcessPurchaseSchema } from '@/validation';

/**
 * Purchase routes aggregator.
 * Scoped under /purchases and protected by robloxAuthGuard.
 */
export const purchaseRoutes = new Elysia({ prefix: '/purchases' })
  .use(robloxAuthGuard)
  .use(
    rateLimit({
      keyPrefix: 'purchase',
      maxRequests: getEnvConfig().rateLimit.robloxPurchaseMax,
      windowSeconds: getEnvConfig().rateLimit.robloxPurchaseWindowSeconds,
    })
  )

  /**
   * POST /purchases/process
   * Processes a Roblox purchase receipt. Idempotent — duplicate purchaseId submissions
   * return a 200 success without re-granting the reward.
   */
  .post('/process', async ({ body, set }) => {
    const parsed = ProcessPurchaseSchema.safeParse(body);

    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid purchase request', {
        issues: parsed.error.issues,
      });
    }

    const { roblox_user_id, roblox_product_id, purchase_id } = parsed.data;
    const result = await processPurchase(roblox_user_id, roblox_product_id, purchase_id);

    return formatResponse({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      ...(result.newGemBalance !== undefined && { newGemBalance: result.newGemBalance }),
    });
  });
