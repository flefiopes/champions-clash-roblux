/**
 * Player routes.
 * Roblox-facing endpoints for player login, profile retrieval, economy actions,
 * and faction management. All routes require a valid X-API-Key header.
 *
 * @module routes/players
 */

import { Elysia } from 'elysia';
import { z } from 'zod/v4';
import { robloxAuthGuard } from '@/middleware/roblox-auth.middleware';
import { rateLimit } from '@/lib/rate-limiter';
import { getEnvConfig } from '@/config';
import { formatResponse, formatErrorResponse } from '@/lib/response-helpers';
import * as economyService from '@/services/economy/economy.service';
import * as warService from '@/services/war/war.service';
import * as questService from '@/services/quest/quest.service';
import * as badgeService from '@/services/badge/badge.service';
import * as playerService from '@/services/player/player.service';
import * as characterService from '@/services/player/character.service';
import {
  PlayerLoginSchema,
  CoinTransactionSchema,
  PointContributionSchema,
  FactionJoinSchema,
  UpgradeAttributeSchema,
} from '@/validation';

/** Zod schema for robloxId path parameter */
const RobloxIdParam = z.object({ robloxId: z.coerce.number().int().positive() });

/**
 * Player routes aggregator.
 * All routes are scoped under /players and protected by robloxAuthGuard.
 */
export const playerRoutes = new Elysia({ prefix: '/players' })
  .use(robloxAuthGuard)

  /**
   * POST /players/login
   * Creates or updates a player record. Called on every Roblox game server join.
   * Returns the full player profile so the client can initialize its local state.
   */
  .post('/login', async ({ body, set }) => {
    const parsed = PlayerLoginSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request body', {
        issues: parsed.error.issues,
      });
    }

    const { roblox_user_id, username } = parsed.data;
    const playerId = await playerService.loginOrCreate(roblox_user_id, username);

    // Assign daily quests on login if needed
    await questService.assignDailyQuests(playerId);

    const profile = await playerService.getProfile(roblox_user_id);
    set.status = 200;
    return formatResponse(profile);
  })

  /**
   * GET /players/:robloxId
   * Returns the full player profile including faction memberships and balances.
   */
  .get('/:robloxId', async ({ params, set }) => {
    const parsed = RobloxIdParam.safeParse(params);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid robloxId');
    }

    const profile = await playerService.getProfile(parsed.data.robloxId);
    return formatResponse(profile);
  })

  /**
   * POST /players/:robloxId/coins
   * Grants coins to a player after a validated in-game action (mini-game, daily login, etc.).
   * Rate-limited per player to prevent farming.
   */
  .use(
    rateLimit({
      keyPrefix: 'coin_gain',
      maxRequests: getEnvConfig().rateLimit.robloxCoinGainMax,
      windowSeconds: getEnvConfig().rateLimit.robloxCoinGainWindowSeconds,
    })
  )
  .post('/:robloxId/coins', async ({ params, body, set }) => {
    const paramParsed = RobloxIdParam.safeParse(params);
    const bodyParsed = CoinTransactionSchema.safeParse(body);

    if (!paramParsed.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request');
    }

    const profile = await playerService.getProfile(paramParsed.data.robloxId);
    const { amount, source, meta } = bodyParsed.data;
    const newBalance = await economyService.addCoins(profile.id, amount, source, meta);

    // Track quest progress
    await questService.updateQuestProgress(profile.id, 'coins_earned', amount);

    return formatResponse({ newCoinBalance: newBalance });
  })

  /**
   * POST /players/:robloxId/points
   * Converts coins to faction points. The core economy loop of the game.
   */
  .use(
    rateLimit({
      keyPrefix: 'point_contrib',
      maxRequests: getEnvConfig().rateLimit.robloxPointContribMax,
      windowSeconds: getEnvConfig().rateLimit.robloxPointContribWindowSeconds,
    })
  )
  .post('/:robloxId/points', async ({ params, body, set }) => {
    const paramParsed = RobloxIdParam.safeParse(params);
    const bodyParsed = PointContributionSchema.safeParse(body);

    if (!paramParsed.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request');
    }

    const profile = await playerService.getProfile(paramParsed.data.robloxId);
    const result = await economyService.contributePoints(
      profile.id,
      bodyParsed.data.coins_spent,
      bodyParsed.data.faction_id,
      bodyParsed.data.war_id
    );

    // Track quest progress
    await questService.updateQuestProgress(profile.id, 'points_contributed', result.pointsAwarded);

    return formatResponse(result);
  })

  /**
   * GET /players/:robloxId/daily-limits
   * Returns today's usage for rate-limited actions (quiz, idle collect, etc.).
   */
  .get('/:robloxId/daily-limits', async ({ params, set }) => {
    const parsed = RobloxIdParam.safeParse(params);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid robloxId');
    }

    const limits = await playerService.getDailyLimits(parsed.data.robloxId);
    return formatResponse(limits);
  })

  /**
   * POST /players/:robloxId/faction
   * Assigns a player to a faction within a war. Enforces the 7-day lock rule.
   */
  .post('/:robloxId/faction', async ({ params, body, set }) => {
    const paramParsed = RobloxIdParam.safeParse(params);
    const bodyParsed = FactionJoinSchema.safeParse(body);

    if (!paramParsed.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request');
    }

    const profile = await playerService.getProfile(paramParsed.data.robloxId);
    await warService.joinFaction(profile.id, bodyParsed.data.faction_id, bodyParsed.data.war_id);

    return formatResponse({ joined: true });
  })

  /**
   * GET /players/:robloxId/boosts
   * Returns all currently active multiplier boosts for the player.
   */
  .get('/:robloxId/boosts', async ({ params, set }) => {
    const parsed = RobloxIdParam.safeParse(params);
    if (!parsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid robloxId');
    }

    const profile = await playerService.getProfile(parsed.data.robloxId);
    const boosts = await economyService.getActiveBoosts(profile.id);
    return formatResponse(boosts);
  })

  /**
   * GET /players/:robloxId/quests
   * Returns all currently assigned quests and their progress.
   */
  .get('/:robloxId/quests', async ({ params }) => {
    const parsed = RobloxIdParam.parse(params);
    const profile = await playerService.getProfile(parsed.robloxId);
    const quests = await questService.getPlayerQuests(profile.id);
    return formatResponse(quests);
  })

  /**
   * POST /players/:robloxId/quests/:questId/claim
   * Claims rewards for a completed quest.
   */
  .post('/:robloxId/quests/:questId/claim', async ({ params }) => {
    const { robloxId, questId } = z
      .object({ robloxId: z.coerce.number(), questId: z.string() })
      .parse(params);
    const profile = await playerService.getProfile(robloxId);
    const rewards = await questService.claimQuestReward(profile.id, questId);
    return formatResponse(rewards);
  })

  /**
   * GET /players/:robloxId/badges
   * Returns the player's earned badge collection.
   */
  .get('/:robloxId/badges', async ({ params }) => {
    const parsed = RobloxIdParam.parse(params);
    const profile = await playerService.getProfile(parsed.robloxId);
    const badges = await badgeService.getPlayerBadges(profile.id);
    return formatResponse(badges);
  })

  /**
   * POST /players/:robloxId/idle/collect
   * Collects accumulated idle coin gains.
   */
  .post('/:robloxId/idle/collect', async ({ params }) => {
    const parsed = RobloxIdParam.parse(params);
    const profile = await playerService.getProfile(parsed.robloxId);
    const result = await characterService.collectIdleCoins(profile.id);
    return formatResponse(result);
  })

  /**
   * POST /players/:robloxId/upgrade
   * Upgrades a character attribute (force, speed, luck).
   */
  .post('/:robloxId/upgrade', async ({ params, body, set }) => {
    const paramParsed = RobloxIdParam.safeParse(params);
    const bodyParsed = UpgradeAttributeSchema.safeParse(body);

    if (!paramParsed.success || !bodyParsed.success) {
      set.status = 400;
      return formatErrorResponse('VALIDATION_ERROR', 'Invalid request');
    }

    const profile = await playerService.getProfile(paramParsed.data.robloxId);
    const result = await characterService.upgradeAttribute(profile.id, bodyParsed.data.attribute);
    return formatResponse(result);
  });
