/**
 * Admin routes.
 * Internal admin dashboard endpoints for managing wars, factions, game config,
 * products, players, and transaction logs.
 * All routes require a valid X-Admin-Key header.
 *
 * @module routes/admin
 */

import { Elysia } from 'elysia';
import { z } from 'zod/v4';
import { adminAuthGuard } from '@/middleware/admin-auth.middleware';
import { rateLimit } from '@/lib/rate-limiter';
import { getEnvConfig } from '@/config';
import {
  formatResponse,
  formatSuccessResponse,
  formatErrorResponse,
  formatPaginatedResponse,
} from '@/lib/response-helpers';
import * as adminService from '@/services/admin/admin.service';
import * as adminConfigService from '@/services/admin/admin-config.service';
import * as adminRewardsService from '@/services/admin/admin-rewards.service';
import { invalidateConfigCache } from '@/services/config/config.service';
import {
  CreateWarSchema,
  UpdateWarSchema,
  CreateFactionSchema,
  UpdateFactionSchema,
  UpdateGameConfigSchema,
  BulkUpdateGameConfigSchema,
  CreateProductSchema,
  UpdateProductSchema,
  TransactionFilterSchema,
  CreateQuestSchema,
  UpdateQuestSchema,
  CreateBadgeSchema,
  UpdateBadgeSchema,
} from '@/validation';

/** Zod schema for UUID path parameters */
const UuidParam = z.object({ id: z.string().uuid() });

/** Placeholder admin username — replaced with real identity when auth is enhanced */
const ADMIN_USERNAME = 'admin';

/**
 * Admin routes aggregator.
 * Scoped under /admin and protected by adminAuthGuard + rate limiting.
 */
export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(adminAuthGuard)
  .use(
    rateLimit({
      keyPrefix: 'admin',
      maxRequests: getEnvConfig().rateLimit.adminMax,
      windowSeconds: getEnvConfig().rateLimit.adminWindowSeconds,
    })
  )

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  /** GET /admin/stats — Retrieve overview statistics */
  .get('/stats', async () => {
    const stats = await adminService.getDashboardStats();
    return formatResponse(stats);
  })

  /** GET /admin/activity — Recent player activity monitoring */
  .get('/activity', async () => {
    const activity = await adminService.getRecentActivity();
    return formatResponse(activity);
  })

  /** GET /admin/minigames — Retrieve mini-game aggregate stats */
  .get('/minigames', async () => {
    const stats = await adminService.getMinigameStats();
    return formatResponse(stats);
  })

  // ---------------------------------------------------------------------------
  // Wars
  // ---------------------------------------------------------------------------

  /** GET /admin/wars — List all wars (all statuses) */
  .get('/wars', async () => {
    const warList = await adminService.listWars();
    return formatResponse(warList);
  })

  /** POST /admin/wars — Create a new war */
  .post('/wars', async ({ body, set }) => {
    const parsed = CreateWarSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid war data', {
        issues: parsed.error.issues,
      });
    }

    const id = await adminService.createWar(parsed.data, ADMIN_USERNAME);
    set.status = 201;
    return formatResponse({ id });
  })

  /** PATCH /admin/wars/:id — Update a war's mutable fields */
  .patch('/wars/:id', async ({ params, body, set }) => {
    const paramParsed = UuidParam.safeParse(params);
    const bodyParsed = UpdateWarSchema.safeParse(body);

    if (!paramParsed.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request');
    }

    await adminService.updateWar(paramParsed.data.id, bodyParsed.data);
    return formatSuccessResponse();
  })

  /** POST /admin/wars/:id/finish — Mark a war as finished */
  .post('/wars/:id/finish', async ({ params, set }) => {
    const parsed = UuidParam.safeParse(params);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid war ID');
    }

    await adminService.finishWar(parsed.data.id);
    return formatSuccessResponse();
  })

  // ---------------------------------------------------------------------------
  // Factions
  // ---------------------------------------------------------------------------

  /** GET /admin/factions — List all factions */
  .get('/factions', async () => {
    const data = await adminService.listFactions();
    return formatResponse(data);
  })

  /** POST /admin/factions — Create a faction for an existing war */
  .post('/factions', async ({ body, set }) => {
    const parsed = CreateFactionSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid faction data', {
        issues: parsed.error.issues,
      });
    }

    const id = await adminService.createFaction(parsed.data);
    set.status = 201;
    return formatResponse({ id });
  })

  /** PATCH /admin/factions/:id — Update a faction's display fields */
  .patch('/factions/:id', async ({ params, body, set }) => {
    const paramParsed = UuidParam.safeParse(params);
    const bodyParsed = UpdateFactionSchema.safeParse(body);

    if (!paramParsed.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request');
    }

    await adminService.updateFaction(paramParsed.data.id, bodyParsed.data);
    return formatSuccessResponse();
  })

  // ---------------------------------------------------------------------------
  // Transactions
  // ---------------------------------------------------------------------------

  /** GET /admin/transactions — Paginated, filterable transaction log */
  .get('/transactions', async ({ query, set }) => {
    const parsed = TransactionFilterSchema.safeParse(query);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid filter parameters');
    }

    const result = await adminService.getTransactionLogs(parsed.data);
    return formatPaginatedResponse(
      result.data,
      result.pagination.total,
      result.pagination.page,
      result.pagination.limit
    );
  })

  // ---------------------------------------------------------------------------
  // Game config
  // ---------------------------------------------------------------------------

  /** GET /admin/config — Full game configuration key-value map */
  .get('/config', async () => {
    const config = await adminConfigService.getGameConfig();
    return formatResponse(config);
  })

  /** PATCH /admin/config/:key — Upsert a single config key */
  .patch('/config/:key', async ({ params, body, set }) => {
    const keyParam = z.object({ key: z.string().min(1).max(100) }).safeParse(params);
    const bodyParsed = UpdateGameConfigSchema.safeParse(body);

    if (!keyParam.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid config update');
    }

    await adminConfigService.updateGameConfig(keyParam.data.key, bodyParsed.data, ADMIN_USERNAME);
    await invalidateConfigCache();
    return formatSuccessResponse();
  })

  /** PUT /admin/config — Bulk update multiple config keys */
  .put('/config', async ({ body, set }) => {
    const parsed = BulkUpdateGameConfigSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid config data');
    }

    await adminConfigService.updateGameConfigBulk(parsed.data, ADMIN_USERNAME);
    await invalidateConfigCache();
    return formatSuccessResponse();
  })

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------

  /** GET /admin/products — Full product catalogue */
  .get('/products', async () => {
    const productList = await adminConfigService.listProducts();
    return formatResponse(productList);
  })

  /** POST /admin/products — Add a new purchasable product */
  .post('/products', async ({ body, set }) => {
    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid product data', {
        issues: parsed.error.issues,
      });
    }

    const id = await adminConfigService.createProduct(parsed.data);
    set.status = 201;
    return formatResponse({ id });
  })

  /** PATCH /admin/products/:id — Update an existing product */
  .patch('/products/:id', async ({ params, body, set }) => {
    const paramParsed = UuidParam.safeParse(params);
    const bodyParsed = UpdateProductSchema.safeParse(body);

    if (!paramParsed.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request');
    }

    await adminConfigService.updateProduct(paramParsed.data.id, bodyParsed.data);
    return formatSuccessResponse();
  })

  // ---------------------------------------------------------------------------
  // Quests
  // ---------------------------------------------------------------------------

  /** GET /admin/quests — List all quest definitions */
  .get('/quests', async () => {
    const data = await adminRewardsService.listQuests();
    return formatResponse(data);
  })

  /** POST /admin/quests — Create a new quest definition */
  .post('/quests', async ({ body, set }) => {
    const parsed = CreateQuestSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid quest data', {
        issues: parsed.error.issues,
      });
    }

    const id = await adminRewardsService.createQuest(parsed.data);
    set.status = 201;
    return formatResponse({ id });
  })

  /** PATCH /admin/quests/:id — Update a quest definition */
  .patch('/quests/:id', async ({ params, body, set }) => {
    const paramParsed = UuidParam.safeParse(params);
    const bodyParsed = UpdateQuestSchema.safeParse(body);

    if (!paramParsed.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request');
    }

    await adminRewardsService.updateQuest(paramParsed.data.id, bodyParsed.data);
    return formatSuccessResponse();
  })

  // ---------------------------------------------------------------------------
  // Badges
  // ---------------------------------------------------------------------------

  /** GET /admin/badges — List all badge definitions */
  .get('/badges', async () => {
    const data = await adminRewardsService.listBadges();
    return formatResponse(data);
  })

  /** POST /admin/badges — Create a new badge definition */
  .post('/badges', async ({ body, set }) => {
    const parsed = CreateBadgeSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid badge data', {
        issues: parsed.error.issues,
      });
    }

    const id = await adminRewardsService.createBadge(parsed.data);
    set.status = 201;
    return formatResponse({ id });
  })

  /** PATCH /admin/badges/:id — Update a badge definition */
  .patch('/badges/:id', async ({ params, body, set }) => {
    const paramParsed = UuidParam.safeParse(params);
    const bodyParsed = UpdateBadgeSchema.safeParse(body);

    if (!paramParsed.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request');
    }

    await adminRewardsService.updateBadge(paramParsed.data.id, bodyParsed.data);
    return formatSuccessResponse();
  });
